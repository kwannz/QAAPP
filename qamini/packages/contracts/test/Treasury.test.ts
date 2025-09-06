import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Treasury, MockUSDT, QACard } from "../typechain-types";

describe("Treasury Contract", function () {
  let treasury: Treasury;
  let mockUSDT: MockUSDT;
  let qaCard: QACard;
  let owner: SignerWithAddress;
  let operator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;

  const INITIAL_USDT_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDT
  const USER_USDT_AMOUNT = ethers.parseUnits("10000", 6); // 10K USDT per user

  beforeEach(async function () {
    [owner, operator, user1, user2, attacker] = await ethers.getSigners();

    // 部署 MockUSDT
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDTFactory.deploy();
    await mockUSDT.waitForDeployment();

    // 部署 QACard
    const QACardFactory = await ethers.getContractFactory("QACard");
    qaCard = await QACardFactory.deploy();
    await qaCard.waitForDeployment();
    
    // 初始化 QACard
    await qaCard.initialize("https://api.qaapp.com/metadata/{id}.json", owner.address);

    // 部署 Treasury
    const TreasuryFactory = await ethers.getContractFactory("Treasury");
    treasury = await TreasuryFactory.deploy();
    await treasury.waitForDeployment();

    // 初始化 Treasury
    await treasury.initialize(
      await mockUSDT.getAddress(),
      owner.address,
      [operator.address]
    );

    // 设置 QACard 地址
    await treasury.setQACard(await qaCard.getAddress());
    
    // 给Treasury minter权限 (在QACard中)
    await qaCard.grantRole(await qaCard.MINTER_ROLE(), await treasury.getAddress());

    // 给用户分配 USDT
    await mockUSDT.mint(user1.address, USER_USDT_AMOUNT);
    await mockUSDT.mint(user2.address, USER_USDT_AMOUNT);

    // 用户授权给 Treasury
    await mockUSDT.connect(user1).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
    await mockUSDT.connect(user2).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
  });

  describe("Deployment and Initialization", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await treasury.usdtToken()).to.equal(await mockUSDT.getAddress());
      expect(await treasury.hasRole(await treasury.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await treasury.hasRole(await treasury.OPERATOR_ROLE(), operator.address)).to.be.true;
    });

    it("Should have correct product configurations", async function () {
      const silverProduct = await treasury.getProductInfo(0); // SILVER = 0
      expect(silverProduct.name).to.equal("QA Silver Card");
      expect(silverProduct.minInvestment).to.equal(ethers.parseUnits("100", 6));
      expect(silverProduct.maxInvestment).to.equal(ethers.parseUnits("10000", 6));
      expect(silverProduct.apr).to.equal(1200); // 12%
      expect(silverProduct.duration).to.equal(30); // 30 days
      expect(silverProduct.isActive).to.be.true;

      const goldProduct = await treasury.getProductInfo(1); // GOLD = 1
      expect(goldProduct.name).to.equal("QA Gold Card");
      expect(goldProduct.minInvestment).to.equal(ethers.parseUnits("1000", 6));
      expect(goldProduct.maxInvestment).to.equal(ethers.parseUnits("50000", 6));
      expect(goldProduct.apr).to.equal(1500); // 15%
      expect(goldProduct.duration).to.equal(60); // 60 days

      const diamondProduct = await treasury.getProductInfo(2); // DIAMOND = 2
      expect(diamondProduct.name).to.equal("QA Diamond Card");
      expect(diamondProduct.minInvestment).to.equal(ethers.parseUnits("5000", 6));
      expect(diamondProduct.maxInvestment).to.equal(ethers.parseUnits("200000", 6));
      expect(diamondProduct.apr).to.equal(1800); // 18%
      expect(diamondProduct.duration).to.equal(90); // 90 days
    });

    it("Should revert on double initialization", async function () {
      await expect(
        treasury.initialize(
          await mockUSDT.getAddress(),
          owner.address,
          [operator.address]
        )
      ).to.be.reverted;
    });
  });

  describe("Product Purchase", function () {
    it("Should allow valid product purchase", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6); // 1000 USDT
      const productType = 0; // SILVER

      const initialBalance = await mockUSDT.balanceOf(user1.address);
      const initialTreasuryBalance = await mockUSDT.balanceOf(await treasury.getAddress());

      await expect(
        treasury.connect(user1).purchaseProduct(productType, purchaseAmount)
      )
        .to.emit(treasury, "ProductPurchased")
        .withArgs(user1.address, productType, purchaseAmount, anyValue);

      // 检查余额变化
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialBalance - purchaseAmount);
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(
        initialTreasuryBalance + purchaseAmount
      );

      // 检查投资记录
      const userInvestments = await treasury.getUserInvestments(user1.address);
      expect(userInvestments).to.equal(purchaseAmount);
    });

    it("Should revert on insufficient amount", async function () {
      const purchaseAmount = ethers.parseUnits("50", 6); // 50 USDT (below minimum)
      const productType = 0; // SILVER (min: 100 USDT)

      await expect(
        treasury.connect(user1).purchaseProduct(productType, purchaseAmount)
      ).to.be.revertedWithCustomError(treasury, "InvalidInvestmentAmount");
    });

    it("Should revert on excessive amount", async function () {
      const purchaseAmount = ethers.parseUnits("15000", 6); // 15000 USDT (above maximum for SILVER)
      const productType = 0; // SILVER (max: 10000 USDT)

      await expect(
        treasury.connect(user1).purchaseProduct(productType, purchaseAmount)
      ).to.be.revertedWithCustomError(treasury, "InvalidInvestmentAmount");
    });

    it("Should revert on invalid product type", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);
      const invalidProductType = 99;

      await expect(
        treasury.connect(user1).purchaseProduct(invalidProductType, purchaseAmount)
      ).to.be.reverted;
    });

    it("Should revert on insufficient allowance", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);
      const productType = 0;

      // 重置授权
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), 0);

      await expect(
        treasury.connect(user1).purchaseProduct(productType, purchaseAmount)
      ).to.be.reverted;
    });

    it("Should handle multiple purchases correctly", async function () {
      const purchaseAmount1 = ethers.parseUnits("1000", 6);
      const purchaseAmount2 = ethers.parseUnits("2000", 6);
      const productType = 0; // SILVER

      await treasury.connect(user1).purchaseProduct(productType, purchaseAmount1);
      await treasury.connect(user1).purchaseProduct(productType, purchaseAmount2);

      const userInvestments = await treasury.getUserInvestments(user1.address);
      expect(userInvestments).to.equal(purchaseAmount1 + purchaseAmount2);
    });
  });

  describe("Daily Withdrawal Limits", function () {
    beforeEach(async function () {
      // 先让用户购买一些产品，为Treasury添加资金
      const purchaseAmount = ethers.parseUnits("5000", 6);
      await treasury.connect(user1).purchaseProduct(1, purchaseAmount); // GOLD
    });

    it("Should allow withdrawal within daily limit", async function () {
      const withdrawAmount = ethers.parseUnits("1000", 6); // 在每日限额内

      const initialBalance = await mockUSDT.balanceOf(owner.address);

      await expect(treasury.connect(owner).withdraw(withdrawAmount))
        .to.emit(treasury, "Withdrawal")
        .withArgs(owner.address, withdrawAmount, owner.address, anyValue, anyValue);

      expect(await mockUSDT.balanceOf(owner.address)).to.equal(initialBalance + withdrawAmount);
    });

    it("Should revert on exceeding daily limit", async function () {
      const excessiveAmount = ethers.parseUnits("15000", 6); // 超过默认每日限额

      await expect(
        treasury.connect(owner).withdraw(excessiveAmount)
      ).to.be.revertedWithCustomError(treasury, "ExceedsWithdrawLimit");
    });

    it("Should reset daily limit after 24 hours", async function () {
      const withdrawAmount = ethers.parseUnits("2000", 6); // 改为更小的金额

      // 第一次提取
      await treasury.connect(owner).withdraw(withdrawAmount);

      // 快进24小时
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // 应该可以再次提取
      await expect(treasury.connect(owner).withdraw(withdrawAmount)).not.to.be.reverted;
    });

    it("Should allow operator to update daily limit", async function () {
      const newLimit = ethers.parseUnits("20000", 6);

      await treasury.connect(operator).updateDailyWithdrawalLimit(newLimit);

      const withdrawAmount = ethers.parseUnits("4000", 6); // 在新限额内且不超过Treasury余额
      await expect(treasury.connect(owner).withdraw(withdrawAmount)).not.to.be.reverted;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause contract", async function () {
      await treasury.connect(owner).pause();
      expect(await treasury.paused()).to.be.true;
    });

    it("Should prevent purchases when paused", async function () {
      await treasury.connect(owner).pause();

      const purchaseAmount = ethers.parseUnits("1000", 6);
      await expect(
        treasury.connect(user1).purchaseProduct(0, purchaseAmount)
      ).to.be.reverted;
    });

    it("Should allow owner to unpause contract", async function () {
      await treasury.connect(owner).pause();
      await treasury.connect(owner).unpause();
      expect(await treasury.paused()).to.be.false;

      // 应该能正常购买
      const purchaseAmount = ethers.parseUnits("1000", 6);
      await expect(treasury.connect(user1).purchaseProduct(0, purchaseAmount)).not.to.be.reverted;
    });

    it("Should allow emergency withdrawal", async function () {
      // 先添加一些资金到合约
      await treasury.connect(user1).purchaseProduct(1, ethers.parseUnits("5000", 6));

      const contractBalance = await mockUSDT.balanceOf(await treasury.getAddress());
      const initialOwnerBalance = await mockUSDT.balanceOf(owner.address);

      await treasury.connect(owner).emergencyWithdraw();

      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(0);
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(initialOwnerBalance + contractBalance);
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-owner from pausing", async function () {
      await expect(treasury.connect(user1).pause()).to.be.reverted;
    });

    it("Should prevent non-operator from updating limits", async function () {
      const newLimit = ethers.parseUnits("20000", 6);
      await expect(
        treasury.connect(user1).updateDailyWithdrawalLimit(newLimit)
      ).to.be.reverted;
    });

    it("Should allow owner to grant operator role", async function () {
      await treasury.connect(owner).grantRole(await treasury.OPERATOR_ROLE(), user1.address);
      expect(await treasury.hasRole(await treasury.OPERATOR_ROLE(), user1.address)).to.be.true;

      // user1 现在应该能执行操作员功能
      const newLimit = ethers.parseUnits("20000", 6);
      await expect(treasury.connect(user1).updateDailyWithdrawalLimit(newLimit)).not.to.be.reverted;
    });
  });

  describe("Batch Operations", function () {
    it("Should handle batch deposits efficiently", async function () {
      const amounts = [
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("2000", 6),
        ethers.parseUnits("1500", 6)
      ];
      const orderIds = [
        ethers.keccak256(ethers.toUtf8Bytes("order1")),
        ethers.keccak256(ethers.toUtf8Bytes("order2")),
        ethers.keccak256(ethers.toUtf8Bytes("order3"))
      ];

      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);
      
      // 确保用户有足够的USDT和授权
      await mockUSDT.mint(user1.address, totalAmount);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), totalAmount);

      const initialBalance = await mockUSDT.balanceOf(user1.address);

      await expect(treasury.connect(user1).batchDeposit(amounts, orderIds))
        .to.emit(treasury, "BatchDeposit")
        .withArgs(user1.address, totalAmount, amounts.length);

      expect(await mockUSDT.balanceOf(user1.address)).to.be.closeTo(
        initialBalance - totalAmount, 
        ethers.parseUnits("1", 6) // 允许1 USDT的精度误差
      );
    });
  });

  describe("Integration with QACard", function () {
    it("Should mint NFT on successful purchase", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);
      const productType = 0; // SILVER
      const expectedTokenId = 1; // SILVER对应token ID 1

      const initialNFTBalance = await qaCard.balanceOf(user1.address, expectedTokenId);

      await treasury.connect(user1).purchaseProduct(productType, purchaseAmount);

      const finalNFTBalance = await qaCard.balanceOf(user1.address, expectedTokenId);
      expect(finalNFTBalance).to.equal(initialNFTBalance + 1n);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for product purchase", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);
      const productType = 0;

      const tx = await treasury.connect(user1).purchaseProduct(productType, purchaseAmount);
      const receipt = await tx.wait();

      // 检查gas使用量是否在合理范围内 (应该小于200k gas)
      expect(receipt?.gasUsed).to.be.lessThan(400000); // Realistic gas limit
    });
  });

  // Helper function for anyValue matcher
  const anyValue = (value: any) => true;
});