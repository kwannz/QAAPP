import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Treasury, MockUSDT, QACard } from "../typechain-types";

describe("Treasury Enhanced Features", function () {
  let treasury: Treasury;
  let mockUSDT: MockUSDT;
  let qaCard: QACard;
  let owner: SignerWithAddress;
  let operator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let referrer: SignerWithAddress;

  const INITIAL_USDT_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDT
  const USER_USDT_AMOUNT = ethers.parseUnits("10000", 6); // 10K USDT per user

  beforeEach(async function () {
    [owner, operator, user1, user2, referrer] = await ethers.getSigners();

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
    
    // 给Treasury minter权限
    await qaCard.grantRole(await qaCard.MINTER_ROLE(), await treasury.getAddress());

    // 给用户分配 USDT
    await mockUSDT.mint(user1.address, USER_USDT_AMOUNT);
    await mockUSDT.mint(user2.address, USER_USDT_AMOUNT);
    await mockUSDT.mint(referrer.address, USER_USDT_AMOUNT);
    await mockUSDT.mint(operator.address, USER_USDT_AMOUNT);

    // 用户授权给 Treasury
    await mockUSDT.connect(user1).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
    await mockUSDT.connect(user2).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
    await mockUSDT.connect(referrer).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
    await mockUSDT.connect(operator).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
  });

  describe("Referral System", function () {
    it("Should set referrer correctly", async function () {
      await treasury.connect(user1).setReferrer(referrer.address);
      
      const userReferralInfo = await treasury.getUserReferralInfo(user1.address);
      expect(userReferralInfo.referrer).to.equal(referrer.address);
    });

    it("Should prevent self-referral", async function () {
      await expect(
        treasury.connect(user1).setReferrer(user1.address)
      ).to.be.revertedWithCustomError(treasury, "InvalidReferrer");
    });

    it("Should calculate referral commission on purchase", async function () {
      // 设置推荐关系
      await treasury.connect(user1).setReferrer(referrer.address);
      
      const purchaseAmount = ethers.parseUnits("1000", 6); // 1000 USDT
      const expectedCommission = (purchaseAmount * 500n) / 10000n; // 5% commission

      await expect(
        treasury.connect(user1).purchaseProduct(0, purchaseAmount)
      ).to.emit(treasury, "ReferralCommissionPaid")
        .withArgs(referrer.address, user1.address, expectedCommission, anyValue);

      const referrerInfo = await treasury.getUserReferralInfo(referrer.address);
      expect(referrerInfo.commissionEarned).to.equal(expectedCommission);
      expect(referrerInfo.totalReferredUsers).to.equal(1);
    });

    it("Should allow purchase with referral in one transaction", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);
      const expectedCommission = (purchaseAmount * 500n) / 10000n;

      await expect(
        treasury.connect(user1).purchaseProductWithReferral(0, purchaseAmount, referrer.address)
      ).to.emit(treasury, "ReferralSet")
        .withArgs(user1.address, referrer.address, anyValue)
        .and.to.emit(treasury, "ReferralCommissionPaid")
        .withArgs(referrer.address, user1.address, expectedCommission, anyValue);
    });

    it("Should allow referrer to claim commission", async function () {
      // 设置推荐并购买
      await treasury.connect(user1).purchaseProductWithReferral(0, ethers.parseUnits("1000", 6), referrer.address);
      
      const expectedCommission = ethers.parseUnits("50", 6); // 5% of 1000
      const initialBalance = await mockUSDT.balanceOf(referrer.address);

      await treasury.connect(referrer).claimReferralCommission();

      const finalBalance = await mockUSDT.balanceOf(referrer.address);
      expect(finalBalance - initialBalance).to.equal(expectedCommission);

      // 佣金应该被清零
      const referrerInfo = await treasury.getUserReferralInfo(referrer.address);
      expect(referrerInfo.commissionEarned).to.equal(0);
    });
  });

  describe("Price Oracle System", function () {
    it("Should allow operator to update ETH price", async function () {
      const newRate = ethers.parseUnits("2500", 6); // 2500 USDT per ETH
      
      await expect(
        treasury.connect(operator).updateETHPrice(newRate)
      ).to.emit(treasury, "PriceUpdated")
        .withArgs(newRate, anyValue, operator.address);

      const priceInfo = await treasury.getCurrentPriceInfo();
      expect(priceInfo.rate).to.equal(newRate);
      expect(priceInfo.isValid).to.be.true;
    });

    it("Should prevent non-operator from updating price", async function () {
      const newRate = ethers.parseUnits("2500", 6);
      
      await expect(
        treasury.connect(user1).updateETHPrice(newRate)
      ).to.be.reverted;
    });

    it("Should reject zero price", async function () {
      await expect(
        treasury.connect(operator).updateETHPrice(0)
      ).to.be.revertedWithCustomError(treasury, "InvalidPrice");
    });

    it("Should detect expired price", async function () {
      // 快进超过价格有效期
      await ethers.provider.send("evm_increaseTime", [2 * 60 * 60]); // 2 hours
      await ethers.provider.send("evm_mine", []);

      const priceInfo = await treasury.getCurrentPriceInfo();
      expect(priceInfo.isValid).to.be.false;

      // ETH购买应该失败
      await expect(
        treasury.connect(user1).purchaseProductWithETH(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(treasury, "PriceExpired");
    });

    it("Should use updated price for ETH purchases", async function () {
      // 更新价格为 3000 USDT per ETH
      const newRate = ethers.parseUnits("3000", 6);
      await treasury.connect(operator).updateETHPrice(newRate);

      const ethAmount = ethers.parseEther("0.1"); // 0.1 ETH
      const expectedUSDT = (ethAmount * newRate) / ethers.parseEther("1"); // 300 USDT

      const initialTreasuryETH = await treasury.getETHBalance();
      
      await treasury.connect(user1).purchaseProductWithETH(0, { value: ethAmount });

      const finalTreasuryETH = await treasury.getETHBalance();
      expect(finalTreasuryETH - initialTreasuryETH).to.equal(ethAmount);

      // 检查用户ETH存款记录
      const userETHDeposits = await treasury.getUserETHDeposits(user1.address);
      expect(userETHDeposits).to.equal(ethAmount);
    });
  });

  describe("Reward Distribution System", function () {
    beforeEach(async function () {
      // 先让用户购买产品以建立投资基础
      await treasury.connect(user1).purchaseProduct(0, ethers.parseUnits("1000", 6));
      await treasury.connect(user2).purchaseProduct(1, ethers.parseUnits("2000", 6));
    });

    it("Should allow operator to start reward period", async function () {
      const rewardAmount = ethers.parseUnits("300", 6); // 300 USDT reward
      
      await expect(
        treasury.connect(operator).startRewardPeriod(rewardAmount)
      ).to.emit(treasury, "RewardPeriodStarted")
        .withArgs(0, rewardAmount, anyValue);

      const periodInfo = await treasury.getPeriodRewardInfo(0);
      expect(periodInfo.totalReward).to.equal(rewardAmount);
    });

    it("Should prevent starting reward period too early", async function () {
      const rewardAmount = ethers.parseUnits("100", 6);
      
      // 第一次启动应该成功
      await treasury.connect(operator).startRewardPeriod(rewardAmount);

      // 立即再次启动应该失败
      await expect(
        treasury.connect(operator).startRewardPeriod(rewardAmount)
      ).to.be.revertedWithCustomError(treasury, "RewardPeriodNotStarted");
    });

    it("Should allow users to claim period rewards", async function () {
      const rewardAmount = ethers.parseUnits("300", 6);
      await treasury.connect(operator).startRewardPeriod(rewardAmount);

      // user1 invested 1000, user2 invested 2000, total 3000
      // user1 should get 1000/3000 * 300 = 100 USDT
      const expectedReward1 = ethers.parseUnits("100", 6);
      
      const initialBalance = await mockUSDT.balanceOf(user1.address);
      
      const periodToCheck = 0; // First period
      
      await expect(
        treasury.connect(user1).claimPeriodReward(periodToCheck)
      ).to.emit(treasury, "RewardClaimed")
        .withArgs(user1.address, periodToCheck, expectedReward1, anyValue);

      const finalBalance = await mockUSDT.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(expectedReward1);

      // 检查奖励已被标记为已领取
      const periodInfo = await treasury.connect(user1).getPeriodRewardInfo(periodToCheck);
      expect(periodInfo.claimed).to.be.true;
    });

    it("Should prevent double claiming", async function () {
      const rewardAmount = ethers.parseUnits("300", 6);
      await treasury.connect(operator).startRewardPeriod(rewardAmount);

      const periodToCheck = 0;
      
      await treasury.connect(user1).claimPeriodReward(periodToCheck);

      await expect(
        treasury.connect(user1).claimPeriodReward(periodToCheck)
      ).to.be.revertedWithCustomError(treasury, "RewardAlreadyClaimed");
    });
  });

  describe("Enhanced Configuration", function () {
    it("Should allow operator to update referral commission rate", async function () {
      const newRate = 300; // 3%
      
      await treasury.connect(operator).setReferralCommissionRate(newRate);
      
      expect(await treasury.referralCommissionRate()).to.equal(newRate);
    });

    it("Should prevent setting excessive referral rate", async function () {
      const excessiveRate = 1500; // 15%
      
      await expect(
        treasury.connect(operator).setReferralCommissionRate(excessiveRate)
      ).to.be.revertedWith("Rate too high");
    });

    it("Should have correct default configurations", async function () {
      expect(await treasury.referralCommissionRate()).to.equal(500); // 5%
      expect(await treasury.rewardPeriodDuration()).to.equal(7 * 24 * 60 * 60); // 7 days
      expect(await treasury.currentRewardPeriod()).to.equal(0);
      
      const priceInfo = await treasury.getCurrentPriceInfo();
      expect(priceInfo.rate).to.equal(ethers.parseUnits("2000", 6)); // 2000 USDT per ETH
      expect(priceInfo.isValid).to.be.true;
    });
  });

  // Helper function for anyValue matcher
  const anyValue = (value: any) => true;
});