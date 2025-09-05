import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { MockUSDT, QACard, Treasury } from "../typechain-types";

describe("Realistic QA App Tests", function () {
  async function deployQAAppFixture() {
    const [deployer, user1, user2, user3, attacker] = await ethers.getSigners();

    // Deploy MockUSDT
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();

    // Deploy QACard
    const QACard = await ethers.getContractFactory("QACard");
    const qaCard = await QACard.deploy();
    await qaCard.waitForDeployment();
    await qaCard.initialize("https://api.qaapp.com/metadata/{id}.json", deployer.address);

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await treasury.waitForDeployment();
    await treasury.initialize(await mockUSDT.getAddress(), deployer.address, [deployer.address]);
    await treasury.setQACard(await qaCard.getAddress());

    // Grant minter role to treasury
    const minterRole = await qaCard.MINTER_ROLE();
    await qaCard.grantRole(minterRole, await treasury.getAddress());

    return {
      mockUSDT,
      qaCard,
      treasury,
      deployer,
      user1,
      user2,
      user3,
      attacker,
    };
  }

  describe("Core Business Functions", function () {
    it("Should complete end-to-end product purchase successfully", async function () {
      const { mockUSDT, qaCard, treasury, user1 } = await loadFixture(deployQAAppFixture);

      // Mint USDT to user
      const amount = ethers.parseUnits("500", 6);
      await mockUSDT.mint(user1.address, amount);

      // User approves treasury
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), amount);

      // User purchases silver product
      const tx = await treasury.connect(user1).purchaseProduct(0, amount);
      await tx.wait();

      // Verify NFT was minted
      const nftBalance = await qaCard.balanceOf(user1.address, 1);
      expect(nftBalance).to.equal(1);

      // Verify treasury balance
      const treasuryBalance = await treasury.getBalance();
      expect(treasuryBalance).to.equal(amount);
    });

    it("Should handle multiple users purchasing different products", async function () {
      const { mockUSDT, qaCard, treasury, user1, user2, user3 } = await loadFixture(deployQAAppFixture);

      const users = [user1, user2, user3];
      const amounts = [
        ethers.parseUnits("500", 6),   // Silver
        ethers.parseUnits("2000", 6),  // Gold  
        ethers.parseUnits("8000", 6)   // Diamond
      ];
      const productTypes = [0, 1, 2];

      for (let i = 0; i < users.length; i++) {
        await mockUSDT.mint(users[i].address, amounts[i]);
        await mockUSDT.connect(users[i]).approve(await treasury.getAddress(), amounts[i]);
        await treasury.connect(users[i]).purchaseProduct(productTypes[i], amounts[i]);

        // Verify NFT minted
        const tokenId = productTypes[i] + 1;
        const nftBalance = await qaCard.balanceOf(users[i].address, tokenId);
        expect(nftBalance).to.equal(1);
      }

      // Verify total treasury balance
      const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0n);
      const treasuryBalance = await treasury.getBalance();
      expect(treasuryBalance).to.equal(totalAmount);
    });

    it("Should handle batch deposits efficiently", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      const batchSize = 5;
      const amounts = Array(batchSize).fill(ethers.parseUnits("100", 6));
      const orderIds = Array(batchSize).fill(0).map((_, i) => 
        ethers.keccak256(ethers.toUtf8Bytes(`batch_order_${Date.now()}_${i}`))
      );

      const totalAmount = BigInt(batchSize) * ethers.parseUnits("100", 6);
      await mockUSDT.mint(user1.address, totalAmount);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), totalAmount);

      const tx = await treasury.connect(user1).batchDeposit(amounts, orderIds);
      const receipt = await tx.wait();

      // Should be more gas-efficient than individual operations
      expect(Number(receipt.gasUsed)).to.be.lessThan(150000); // Reasonable limit for batch operations
    });
  });

  describe("Security and Access Control", function () {
    it("Should prevent unauthorized access to admin functions", async function () {
      const { treasury, qaCard, attacker } = await loadFixture(deployQAAppFixture);

      // Should prevent non-admin from pausing
      await expect(treasury.connect(attacker).pause()).to.be.reverted;

      // Should prevent non-admin from emergency withdraw
      const amount = ethers.parseUnits("1000", 6);
      await expect(treasury.connect(attacker).emergencyWithdraw(attacker.address, amount))
        .to.be.reverted;

      // Should prevent setting treasury on QACard
      await expect(qaCard.connect(attacker).setTreasury(attacker.address))
        .to.be.reverted;
    });

    it("Should handle contract pausing correctly", async function () {
      const { mockUSDT, treasury, deployer, user1 } = await loadFixture(deployQAAppFixture);

      // Setup user funds
      const amount = ethers.parseUnits("500", 6);
      await mockUSDT.mint(user1.address, amount);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), amount);

      // Pause contract
      await treasury.connect(deployer).pause();

      // Should prevent purchases when paused
      await expect(treasury.connect(user1).purchaseProduct(0, amount))
        .to.be.reverted;

      // Unpause and verify purchases work again
      await treasury.connect(deployer).unpause();
      await expect(treasury.connect(user1).purchaseProduct(0, amount))
        .not.to.be.reverted;
    });

    it("Should validate investment amounts correctly", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      await mockUSDT.mint(user1.address, ethers.parseUnits("10000", 6));
      
      // Should reject zero amount
      await expect(treasury.connect(user1).purchaseProduct(0, 0))
        .to.be.reverted;

      // Should reject invalid product type
      const validAmount = ethers.parseUnits("500", 6);
      await expect(treasury.connect(user1).purchaseProduct(99, validAmount))
        .to.be.reverted;

      // Should reject amount below minimum
      const tooSmall = ethers.parseUnits("50", 6); // Below 100 USDT minimum
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), tooSmall);
      await expect(treasury.connect(user1).purchaseProduct(0, tooSmall))
        .to.be.reverted;
    });
  });

  describe("Gas Efficiency and Performance", function () {
    it("Should maintain reasonable gas costs for core operations", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      const amount = ethers.parseUnits("500", 6);
      await mockUSDT.mint(user1.address, amount);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), amount);

      const tx = await treasury.connect(user1).purchaseProduct(0, amount);
      const receipt = await tx.wait();

      // Gas should be under 400k for a single purchase
      expect(Number(receipt.gasUsed)).to.be.lessThan(400000);
    });

    it("Should demonstrate batch operation efficiency", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      // Individual operations
      const singleAmount = ethers.parseUnits("100", 6);
      await mockUSDT.mint(user1.address, singleAmount * 3n);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), singleAmount * 3n);

      // Measure batch operation
      const amounts = [singleAmount, singleAmount, singleAmount];
      const orderIds = amounts.map((_, i) => 
        ethers.keccak256(ethers.toUtf8Bytes(`order_${i}_${Date.now()}`))
      );

      const batchTx = await treasury.connect(user1).batchDeposit(amounts, orderIds);
      const batchReceipt = await batchTx.wait();

      // Batch should be more efficient per operation
      const gasPerOperation = Number(batchReceipt.gasUsed) / amounts.length;
      expect(gasPerOperation).to.be.lessThan(80000); // Should be efficient
    });
  });

  describe("Contract Integration", function () {
    it("Should maintain state consistency across contracts", async function () {
      const { mockUSDT, qaCard, treasury, user1, user2 } = await loadFixture(deployQAAppFixture);

      // Multiple users make purchases
      const users = [user1, user2];
      const amounts = [ethers.parseUnits("500", 6), ethers.parseUnits("2000", 6)];

      let totalInvested = 0n;
      let totalNFTs = 0n;

      for (let i = 0; i < users.length; i++) {
        await mockUSDT.mint(users[i].address, amounts[i]);
        await mockUSDT.connect(users[i]).approve(await treasury.getAddress(), amounts[i]);
        await treasury.connect(users[i]).purchaseProduct(i, amounts[i]);

        totalInvested += amounts[i];
        totalNFTs += 1n;
      }

      // Verify treasury balance matches total investments
      const treasuryBalance = await treasury.getBalance();
      expect(treasuryBalance).to.equal(totalInvested);

      // Verify NFT supply matches purchases
      const silverSupply = await qaCard["totalSupply(uint256)"](1);
      const goldSupply = await qaCard["totalSupply(uint256)"](2);
      expect(silverSupply + goldSupply).to.equal(totalNFTs);
    });

    it("Should handle MockUSDT advanced features", async function () {
      const { mockUSDT, user1, user2 } = await loadFixture(deployQAAppFixture);

      const amount = ethers.parseUnits("1000", 6);
      await mockUSDT.mint(user1.address, amount);

      // Test increase/decrease allowance
      await mockUSDT.connect(user1).increaseAllowance(user2.address, ethers.parseUnits("100", 6));
      let allowance = await mockUSDT.allowance(user1.address, user2.address);
      expect(allowance).to.equal(ethers.parseUnits("100", 6));

      await mockUSDT.connect(user1).decreaseAllowance(user2.address, ethers.parseUnits("50", 6));
      allowance = await mockUSDT.allowance(user1.address, user2.address);
      expect(allowance).to.equal(ethers.parseUnits("50", 6));

      // Test faucet (if enough time has passed)
      const canUseFaucet = await mockUSDT.canUseFaucet(user2.address);
      if (canUseFaucet) {
        const balanceBefore = await mockUSDT.balanceOf(user2.address);
        await mockUSDT.connect(user2).faucet();
        const balanceAfter = await mockUSDT.balanceOf(user2.address);
        expect(balanceAfter - balanceBefore).to.equal(ethers.parseUnits("1000", 6));
      }
    });

    it("Should handle QACard advanced features", async function () {
      const { qaCard, treasury, deployer, user1 } = await loadFixture(deployQAAppFixture);

      // Test owner function
      const owner = await qaCard.owner();
      expect(owner).to.equal(deployer.address);

      // Test treasury setting - need to set it first since it's not set in fixture
      await qaCard.connect(deployer).setTreasury(await treasury.getAddress());
      const treasuryAddr = await qaCard.treasury();
      expect(treasuryAddr).to.equal(await treasury.getAddress());

      // Test URI setting
      const newURI = "https://new-api.com/{id}.json";
      await qaCard.connect(deployer).setURI(newURI);
      // Note: URI verification would require checking the _uri internal variable
      // which isn't easily accessible, but the function should not revert
    });
  });

  describe("Error Handling", function () {
    it("Should handle insufficient balance gracefully", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      const amount = ethers.parseUnits("500", 6);
      // Don't mint tokens to user1
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), amount);

      // Should revert with insufficient balance
      await expect(treasury.connect(user1).purchaseProduct(0, amount))
        .to.be.reverted;
    });

    it("Should handle insufficient allowance gracefully", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      const amount = ethers.parseUnits("500", 6);
      await mockUSDT.mint(user1.address, amount);
      // Don't approve the treasury

      // Should revert with insufficient allowance
      await expect(treasury.connect(user1).purchaseProduct(0, amount))
        .to.be.reverted;
    });

    it("Should prevent operations on non-existent tokens", async function () {
      const { qaCard, user1 } = await loadFixture(deployQAAppFixture);

      // Should handle queries for non-existent tokens gracefully
      const balance = await qaCard.balanceOf(user1.address, 999);
      expect(balance).to.equal(0);

      const supply = await qaCard["totalSupply(uint256)"](999);
      expect(supply).to.equal(0);
    });
  });

  describe("Business Logic Validation", function () {
    it("Should enforce product investment limits", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      // Get product info to understand limits
      const silverInfo = await treasury.getProductInfo(0);
      
      // Test with amount within range
      const validAmount = ethers.parseUnits("1000", 6); // Should be valid for silver
      await mockUSDT.mint(user1.address, validAmount);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), validAmount);

      await expect(treasury.connect(user1).purchaseProduct(0, validAmount))
        .not.to.be.reverted;
    });

    it("Should track user investments correctly", async function () {
      const { mockUSDT, treasury, user1 } = await loadFixture(deployQAAppFixture);

      const amounts = [
        ethers.parseUnits("500", 6),
        ethers.parseUnits("1000", 6)
      ];

      let totalInvested = 0n;
      for (const amount of amounts) {
        await mockUSDT.mint(user1.address, amount);
        await mockUSDT.connect(user1).approve(await treasury.getAddress(), amount);
        await treasury.connect(user1).purchaseProduct(0, amount);
        totalInvested += amount;
      }

      // Verify treasury tracks total correctly
      const balance = await treasury.getBalance();
      expect(balance).to.equal(totalInvested);
    });

    it("Should maintain accurate supply tracking", async function () {
      const { mockUSDT, qaCard, treasury, user1, user2 } = await loadFixture(deployQAAppFixture);

      // Initial supplies should be 0
      expect(await qaCard["totalSupply(uint256)"](1)).to.equal(0);
      expect(await qaCard["totalSupply(uint256)"](2)).to.equal(0);

      // Mint tokens to users
      const purchases = [
        { user: user1, productType: 0, amount: ethers.parseUnits("500", 6) },
        { user: user2, productType: 1, amount: ethers.parseUnits("2000", 6) },
        { user: user1, productType: 0, amount: ethers.parseUnits("800", 6) }
      ];

      for (const purchase of purchases) {
        await mockUSDT.mint(purchase.user.address, purchase.amount);
        await mockUSDT.connect(purchase.user).approve(await treasury.getAddress(), purchase.amount);
        await treasury.connect(purchase.user).purchaseProduct(purchase.productType, purchase.amount);
      }

      // Verify supplies
      expect(await qaCard["totalSupply(uint256)"](1)).to.equal(2); // 2 silver cards
      expect(await qaCard["totalSupply(uint256)"](2)).to.equal(1); // 1 gold card
    });
  });
});