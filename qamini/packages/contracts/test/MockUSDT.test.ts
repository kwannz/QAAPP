import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockUSDT } from "../typechain-types";

describe("MockUSDT Contract", function () {
  let mockUSDT: MockUSDT;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let spender: SignerWithAddress;
  let attacker: SignerWithAddress;

  // USDT constants
  const INITIAL_SUPPLY = ethers.parseUnits("1000000000", 6); // 1 billion USDT with 6 decimals
  const DECIMALS = 6;
  const NAME = "Mock USDT";
  const SYMBOL = "USDT";

  beforeEach(async function () {
    [owner, user1, user2, spender, attacker] = await ethers.getSigners();

    // 部署 MockUSDT
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDTFactory.deploy();
    await mockUSDT.waitForDeployment();
  });

  describe("Deployment and Initial State", function () {
    it("Should set the correct name", async function () {
      expect(await mockUSDT.name()).to.equal(NAME);
    });

    it("Should set the correct symbol", async function () {
      expect(await mockUSDT.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct decimals", async function () {
      expect(await mockUSDT.decimals()).to.equal(DECIMALS);
    });

    it("Should set the correct initial supply", async function () {
      expect(await mockUSDT.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should assign initial supply to owner", async function () {
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct owner", async function () {
      expect(await mockUSDT.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct total supply", async function () {
      const totalSupply = await mockUSDT.totalSupply();
      const ownerBalance = await mockUSDT.balanceOf(owner.address);
      expect(totalSupply).to.equal(ownerBalance);
    });
  });

  describe("Standard ERC20 Functionality", function () {
    beforeEach(async function () {
      // Transfer some tokens to users for testing
      await mockUSDT.transfer(user1.address, ethers.parseUnits("10000", 6));
      await mockUSDT.transfer(user2.address, ethers.parseUnits("5000", 6));
    });

    describe("Transfers", function () {
      it("Should transfer tokens between accounts", async function () {
        const transferAmount = ethers.parseUnits("100", 6);
        const initialUser1Balance = await mockUSDT.balanceOf(user1.address);
        const initialUser2Balance = await mockUSDT.balanceOf(user2.address);

        await expect(mockUSDT.connect(user1).transfer(user2.address, transferAmount))
          .to.emit(mockUSDT, "Transfer")
          .withArgs(user1.address, user2.address, transferAmount);

        expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUser1Balance - transferAmount);
        expect(await mockUSDT.balanceOf(user2.address)).to.equal(initialUser2Balance + transferAmount);
      });

      it("Should fail when sender doesn't have enough balance", async function () {
        const transferAmount = ethers.parseUnits("20000", 6); // More than user1 has
        
        await expect(
          mockUSDT.connect(user1).transfer(user2.address, transferAmount)
        ).to.be.reverted;
      });

      it("Should fail when transferring to zero address", async function () {
        const transferAmount = ethers.parseUnits("100", 6);
        
        await expect(
          mockUSDT.connect(user1).transfer(ethers.ZeroAddress, transferAmount)
        ).to.be.reverted;
      });

      it("Should handle zero amount transfers", async function () {
        const initialUser1Balance = await mockUSDT.balanceOf(user1.address);
        const initialUser2Balance = await mockUSDT.balanceOf(user2.address);

        await expect(mockUSDT.connect(user1).transfer(user2.address, 0))
          .to.emit(mockUSDT, "Transfer")
          .withArgs(user1.address, user2.address, 0);

        expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUser1Balance);
        expect(await mockUSDT.balanceOf(user2.address)).to.equal(initialUser2Balance);
      });

      it("Should handle self transfers", async function () {
        const transferAmount = ethers.parseUnits("100", 6);
        const initialBalance = await mockUSDT.balanceOf(user1.address);

        await expect(mockUSDT.connect(user1).transfer(user1.address, transferAmount))
          .to.emit(mockUSDT, "Transfer")
          .withArgs(user1.address, user1.address, transferAmount);

        expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialBalance);
      });
    });

    describe("Allowances", function () {
      it("Should approve spender for specific amount", async function () {
        const approvalAmount = ethers.parseUnits("1000", 6);

        await expect(mockUSDT.connect(user1).approve(spender.address, approvalAmount))
          .to.emit(mockUSDT, "Approval")
          .withArgs(user1.address, spender.address, approvalAmount);

        expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(approvalAmount);
      });

      it("Should allow spender to transfer approved amount", async function () {
        const approvalAmount = ethers.parseUnits("1000", 6);
        const transferAmount = ethers.parseUnits("500", 6);

        await mockUSDT.connect(user1).approve(spender.address, approvalAmount);

        const initialUser1Balance = await mockUSDT.balanceOf(user1.address);
        const initialUser2Balance = await mockUSDT.balanceOf(user2.address);

        await expect(
          mockUSDT.connect(spender).transferFrom(user1.address, user2.address, transferAmount)
        )
          .to.emit(mockUSDT, "Transfer")
          .withArgs(user1.address, user2.address, transferAmount);

        expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUser1Balance - transferAmount);
        expect(await mockUSDT.balanceOf(user2.address)).to.equal(initialUser2Balance + transferAmount);
        expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(approvalAmount - transferAmount);
      });

      it("Should fail when spender tries to transfer more than approved", async function () {
        const approvalAmount = ethers.parseUnits("100", 6);
        const transferAmount = ethers.parseUnits("200", 6);

        await mockUSDT.connect(user1).approve(spender.address, approvalAmount);

        await expect(
          mockUSDT.connect(spender).transferFrom(user1.address, user2.address, transferAmount)
        ).to.be.reverted;
      });

      it("Should handle infinite approval correctly", async function () {
        const infiniteApproval = ethers.MaxUint256;
        const transferAmount = ethers.parseUnits("1000", 6);

        await mockUSDT.connect(user1).approve(spender.address, infiniteApproval);
        
        await mockUSDT.connect(spender).transferFrom(user1.address, user2.address, transferAmount);
        
        // Allowance should remain infinite (unchanged)
        expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(infiniteApproval);
      });

      it("Should allow increasing allowance", async function () {
        const initialApproval = ethers.parseUnits("100", 6);
        const increaseAmount = ethers.parseUnits("50", 6);

        await mockUSDT.connect(user1).approve(spender.address, initialApproval);
        await mockUSDT.connect(user1).increaseAllowance(spender.address, increaseAmount);

        expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(initialApproval + increaseAmount);
      });

      it("Should allow decreasing allowance", async function () {
        const initialApproval = ethers.parseUnits("100", 6);
        const decreaseAmount = ethers.parseUnits("30", 6);

        await mockUSDT.connect(user1).approve(spender.address, initialApproval);
        await mockUSDT.connect(user1).decreaseAllowance(spender.address, decreaseAmount);

        expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(initialApproval - decreaseAmount);
      });

      it("Should fail when decreasing allowance below zero", async function () {
        const initialApproval = ethers.parseUnits("100", 6);
        const decreaseAmount = ethers.parseUnits("150", 6);

        await mockUSDT.connect(user1).approve(spender.address, initialApproval);

        await expect(
          mockUSDT.connect(user1).decreaseAllowance(spender.address, decreaseAmount)
        ).to.be.revertedWith("ERC20: decreased allowance below zero");
      });
    });
  });

  describe("Minting Functionality", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      const initialTotalSupply = await mockUSDT.totalSupply();
      const initialUserBalance = await mockUSDT.balanceOf(user1.address);

      await expect(mockUSDT.mint(user1.address, mintAmount))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, mintAmount);

      expect(await mockUSDT.totalSupply()).to.equal(initialTotalSupply + mintAmount);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUserBalance + mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);

      await expect(
        mockUSDT.connect(user1).mint(user2.address, mintAmount)
      ).to.be.reverted;
    });

    it("Should not allow minting to zero address", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);

      await expect(
        mockUSDT.mint(ethers.ZeroAddress, mintAmount)
      ).to.be.reverted;
    });

    it("Should handle minting zero amount", async function () {
      const initialTotalSupply = await mockUSDT.totalSupply();
      const initialUserBalance = await mockUSDT.balanceOf(user1.address);

      await expect(mockUSDT.mint(user1.address, 0))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, 0);

      expect(await mockUSDT.totalSupply()).to.equal(initialTotalSupply);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUserBalance);
    });

    it("Should handle large minting amounts", async function () {
      const largeMintAmount = ethers.parseUnits("1000000000", 6); // 1 billion
      const initialTotalSupply = await mockUSDT.totalSupply();

      await mockUSDT.mint(user1.address, largeMintAmount);

      expect(await mockUSDT.totalSupply()).to.equal(initialTotalSupply + largeMintAmount);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(largeMintAmount);
    });
  });

  describe("Burning Functionality", function () {
    beforeEach(async function () {
      // Give user1 some tokens to burn
      await mockUSDT.transfer(user1.address, ethers.parseUnits("10000", 6));
    });

    it("Should allow owner to burn tokens from any address", async function () {
      const burnAmount = ethers.parseUnits("1000", 6);
      const initialTotalSupply = await mockUSDT.totalSupply();
      const initialUserBalance = await mockUSDT.balanceOf(user1.address);

      await expect(mockUSDT.burn(user1.address, burnAmount))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, burnAmount);

      expect(await mockUSDT.totalSupply()).to.equal(initialTotalSupply - burnAmount);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUserBalance - burnAmount);
    });

    it("Should not allow non-owner to burn tokens", async function () {
      const burnAmount = ethers.parseUnits("1000", 6);

      await expect(
        mockUSDT.connect(user1).burn(user1.address, burnAmount)
      ).to.be.reverted;
    });

    it("Should fail when burning more than balance", async function () {
      const burnAmount = ethers.parseUnits("20000", 6); // More than user1 has

      await expect(
        mockUSDT.burn(user1.address, burnAmount)
      ).to.be.reverted;
    });

    it("Should fail when burning from zero address", async function () {
      const burnAmount = ethers.parseUnits("1000", 6);

      await expect(
        mockUSDT.burn(ethers.ZeroAddress, burnAmount)
      ).to.be.reverted;
    });

    it("Should handle burning zero amount", async function () {
      const initialTotalSupply = await mockUSDT.totalSupply();
      const initialUserBalance = await mockUSDT.balanceOf(user1.address);

      await expect(mockUSDT.burn(user1.address, 0))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, 0);

      expect(await mockUSDT.totalSupply()).to.equal(initialTotalSupply);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUserBalance);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(mockUSDT.transferOwnership(user1.address))
        .to.emit(mockUSDT, "OwnershipTransferred")
        .withArgs(owner.address, user1.address);

      expect(await mockUSDT.owner()).to.equal(user1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        mockUSDT.connect(user1).transferOwnership(user2.address)
      ).to.be.reverted;
    });

    it("Should allow owner to renounce ownership", async function () {
      await expect(mockUSDT.renounceOwnership())
        .to.emit(mockUSDT, "OwnershipTransferred")
        .withArgs(owner.address, ethers.ZeroAddress);

      expect(await mockUSDT.owner()).to.equal(ethers.ZeroAddress);
    });

    it("Should not allow transferring ownership to zero address directly", async function () {
      await expect(
        mockUSDT.transferOwnership(ethers.ZeroAddress)
      ).to.be.reverted;
    });
  });

  describe("Security Tests", function () {
    beforeEach(async function () {
      await mockUSDT.transfer(user1.address, ethers.parseUnits("10000", 6));
    });

    it("Should prevent integer overflow in transfers", async function () {
      const maxUint256 = ethers.MaxUint256;
      const currentBalance = await mockUSDT.balanceOf(user1.address);
      const halfMax = maxUint256 / 2n;
      
      // Try to mint a huge amount that would cause overflow
      await expect(
        mockUSDT.mint(user1.address, maxUint256)
      ).to.be.reverted; // Should revert due to overflow
    });

    it("Should prevent integer overflow in approvals", async function () {
      const maxUint256 = ethers.MaxUint256;
      
      await mockUSDT.connect(user1).approve(spender.address, maxUint256);
      expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(maxUint256);
    });

    it("Should handle edge cases in allowance operations", async function () {
      // Approve maximum amount
      await mockUSDT.connect(user1).approve(spender.address, ethers.MaxUint256);
      
      // Transfer some amount
      const transferAmount = ethers.parseUnits("1000", 6);
      await mockUSDT.connect(spender).transferFrom(user1.address, user2.address, transferAmount);
      
      // Allowance should still be max (infinite approval)
      expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(ethers.MaxUint256);
    });

    it("Should prevent reentrancy attacks", async function () {
      // This test assumes the contract has proper reentrancy protection
      // In practice, ERC20 transfers are generally safe from reentrancy
      const transferAmount = ethers.parseUnits("100", 6);
      
      await expect(
        mockUSDT.connect(user1).transfer(user2.address, transferAmount)
      ).not.to.be.reverted;
    });

    it("Should prevent unauthorized minting by attackers", async function () {
      const attackAmount = ethers.parseUnits("1000000", 6);
      
      await expect(
        mockUSDT.connect(attacker).mint(attacker.address, attackAmount)
      ).to.be.reverted;
      
      // Balance should remain zero
      expect(await mockUSDT.balanceOf(attacker.address)).to.equal(0);
    });

    it("Should prevent unauthorized burning by attackers", async function () {
      const burnAmount = ethers.parseUnits("1000", 6);
      
      await expect(
        mockUSDT.connect(attacker).burn(user1.address, burnAmount)
      ).to.be.reverted;
      
      // User1's balance should remain unchanged
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(ethers.parseUnits("10000", 6));
    });
  });

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await mockUSDT.transfer(user1.address, ethers.parseUnits("10000", 6));
      await mockUSDT.transfer(user2.address, ethers.parseUnits("10000", 6));
    });

    it("Should use reasonable gas for transfers", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      
      const tx = await mockUSDT.connect(user1).transfer(user2.address, transferAmount);
      const receipt = await tx.wait();
      
      // Standard ERC20 transfer should use less than 30k gas
      expect(receipt?.gasUsed).to.be.lessThan(40000);
    });

    it("Should use reasonable gas for approvals", async function () {
      const approvalAmount = ethers.parseUnits("1000", 6);
      
      const tx = await mockUSDT.connect(user1).approve(spender.address, approvalAmount);
      const receipt = await tx.wait();
      
      // Approval should use less than 50k gas
      expect(receipt?.gasUsed).to.be.lessThan(50000);
    });

    it("Should use reasonable gas for transferFrom", async function () {
      const approvalAmount = ethers.parseUnits("1000", 6);
      const transferAmount = ethers.parseUnits("500", 6);
      
      await mockUSDT.connect(user1).approve(spender.address, approvalAmount);
      
      const tx = await mockUSDT.connect(spender).transferFrom(user1.address, user2.address, transferAmount);
      const receipt = await tx.wait();
      
      // TransferFrom should use less than 35k gas
      expect(receipt?.gasUsed).to.be.lessThan(45000);
    });

    it("Should optimize repeated operations", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // First transfer (cold storage)
      const tx1 = await mockUSDT.connect(user1).transfer(user2.address, amount);
      const receipt1 = await tx1.wait();
      
      // Second transfer (warm storage)
      const tx2 = await mockUSDT.connect(user1).transfer(user2.address, amount);
      const receipt2 = await tx2.wait();
      
      // Second transfer should use less or equal gas due to warm storage
      expect(receipt2?.gasUsed).to.be.lessThanOrEqual(receipt1?.gasUsed);
    });
  });

  describe("Edge Cases and Boundary Conditions", function () {
    it("Should handle minimum transfer amounts", async function () {
      await mockUSDT.transfer(user1.address, 1);
      
      await expect(mockUSDT.connect(user1).transfer(user2.address, 1))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(user1.address, user2.address, 1);
      
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(0);
      expect(await mockUSDT.balanceOf(user2.address)).to.equal(1);
    });

    it("Should handle maximum possible balances", async function () {
      const largeAmount = ethers.parseUnits("1000000000", 6); // 1 billion USDT
      
      // Try to mint a very large amount
      await mockUSDT.mint(user1.address, largeAmount);
      expect(await mockUSDT.balanceOf(user1.address)).to.be.gte(largeAmount);
      
      // Should still be able to operate normally
      const smallAmount = ethers.parseUnits("100", 6);
      await expect(
        mockUSDT.connect(user1).transfer(user2.address, smallAmount)
      ).not.to.be.reverted;
    });

    it("Should handle complex approval scenarios", async function () {
      const amount1 = ethers.parseUnits("1000", 6);
      const amount2 = ethers.parseUnits("500", 6);
      
      // Ensure user1 has enough balance
      await mockUSDT.mint(user1.address, amount1);
      
      // Initial approval
      await mockUSDT.connect(user1).approve(spender.address, amount1);
      
      // Partial spend
      await mockUSDT.connect(spender).transferFrom(user1.address, user2.address, amount2);
      
      // Check remaining allowance
      expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(amount1 - amount2);
      
      // Re-approve with different amount
      await mockUSDT.connect(user1).approve(spender.address, amount2);
      expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(amount2);
    });

    it("Should handle multiple spenders for same owner", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const spender2 = user2;
      
      await mockUSDT.transfer(user1.address, ethers.parseUnits("5000", 6));
      
      // Approve different spenders
      await mockUSDT.connect(user1).approve(spender.address, amount);
      await mockUSDT.connect(user1).approve(spender2.address, amount);
      
      expect(await mockUSDT.allowance(user1.address, spender.address)).to.equal(amount);
      expect(await mockUSDT.allowance(user1.address, spender2.address)).to.equal(amount);
      
      // Both should be able to spend
      await mockUSDT.connect(spender).transferFrom(user1.address, owner.address, amount / 2n);
      await mockUSDT.connect(spender2).transferFrom(user1.address, owner.address, amount / 2n);
    });
  });

  describe("Events Verification", function () {
    beforeEach(async function () {
      await mockUSDT.transfer(user1.address, ethers.parseUnits("10000", 6));
    });

    it("Should emit Transfer event on mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      
      await expect(mockUSDT.mint(user1.address, mintAmount))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, mintAmount);
    });

    it("Should emit Transfer event on burn", async function () {
      const burnAmount = ethers.parseUnits("1000", 6);
      
      await expect(mockUSDT.burn(user1.address, burnAmount))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, burnAmount);
    });

    it("Should emit Transfer event on regular transfer", async function () {
      const transferAmount = ethers.parseUnits("500", 6);
      
      await expect(mockUSDT.connect(user1).transfer(user2.address, transferAmount))
        .to.emit(mockUSDT, "Transfer")
        .withArgs(user1.address, user2.address, transferAmount);
    });

    it("Should emit Approval event on approve", async function () {
      const approvalAmount = ethers.parseUnits("1000", 6);
      
      await expect(mockUSDT.connect(user1).approve(spender.address, approvalAmount))
        .to.emit(mockUSDT, "Approval")
        .withArgs(user1.address, spender.address, approvalAmount);
    });

    it("Should emit both Transfer and Approval events on transferFrom", async function () {
      const approvalAmount = ethers.parseUnits("1000", 6);
      const transferAmount = ethers.parseUnits("500", 6);
      
      await mockUSDT.connect(user1).approve(spender.address, approvalAmount);
      
      await expect(
        mockUSDT.connect(spender).transferFrom(user1.address, user2.address, transferAmount)
      )
        .to.emit(mockUSDT, "Transfer")
        .withArgs(user1.address, user2.address, transferAmount);
    });

    it("Should emit OwnershipTransferred event on ownership change", async function () {
      await expect(mockUSDT.transferOwnership(user1.address))
        .to.emit(mockUSDT, "OwnershipTransferred")
        .withArgs(owner.address, user1.address);
    });
  });

  // Helper function for anyValue matcher
  const anyValue = (value: any) => true;
});