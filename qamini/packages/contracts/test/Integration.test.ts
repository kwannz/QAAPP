import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Treasury, MockUSDT, QACard } from "../typechain-types";

describe("Contract Integration Tests", function () {
  let treasury: Treasury;
  let mockUSDT: MockUSDT;
  let qaCard: QACard;
  let owner: SignerWithAddress;
  let operator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  const INITIAL_USDT_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDT
  const USER_USDT_AMOUNT = ethers.parseUnits("10000", 6); // 10K USDT per user

  // Product types
  const SILVER = 0;
  const GOLD = 1;
  const DIAMOND = 2;

  // NFT Token IDs
  const SILVER_TOKEN_ID = 1;
  const GOLD_TOKEN_ID = 2;
  const DIAMOND_TOKEN_ID = 3;

  beforeEach(async function () {
    [owner, operator, user1, user2, user3] = await ethers.getSigners();

    // 部署所有合约
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDTFactory.deploy();
    await mockUSDT.waitForDeployment();

    const QACardFactory = await ethers.getContractFactory("QACard");
    qaCard = await QACardFactory.deploy();
    await qaCard.waitForDeployment();
    
    // 初始化 QACard
    await qaCard.initialize("https://api.qaapp.com/metadata/{id}.json", owner.address);

    const TreasuryFactory = await ethers.getContractFactory("Treasury");
    treasury = await TreasuryFactory.deploy();
    await treasury.waitForDeployment();

    // 初始化 Treasury
    await treasury.initialize(
      await mockUSDT.getAddress(),
      owner.address,
      [operator.address]
    );

    // 设置合约间关联
    await treasury.setQACard(await qaCard.getAddress());
    
    // 给Treasury minter权限
    await qaCard.grantRole(await qaCard.MINTER_ROLE(), await treasury.getAddress());

    // 给用户分配 USDT
    await mockUSDT.mint(user1.address, USER_USDT_AMOUNT);
    await mockUSDT.mint(user2.address, USER_USDT_AMOUNT);
    await mockUSDT.mint(user3.address, USER_USDT_AMOUNT);

    // 用户授权给 Treasury
    await mockUSDT.connect(user1).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
    await mockUSDT.connect(user2).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
    await mockUSDT.connect(user3).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
  });

  describe("End-to-End Product Purchase Flow", function () {
    it("Should complete full purchase flow with NFT minting", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6); // 1000 USDT
      const productType = SILVER;

      // 记录初始状态
      const initialUserUSDTBalance = await mockUSDT.balanceOf(user1.address);
      const initialTreasuryBalance = await mockUSDT.balanceOf(await treasury.getAddress());
      const initialNFTBalance = await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID);

      // 购买产品
      await expect(
        treasury.connect(user1).purchaseProduct(productType, purchaseAmount)
      )
        .to.emit(treasury, "ProductPurchased")
        .withArgs(user1.address, productType, purchaseAmount, anyValue)
        .and.to.emit(mockUSDT, "Transfer")
        .withArgs(user1.address, await treasury.getAddress(), purchaseAmount)
        .and.to.emit(qaCard, "TransferSingle")
        .withArgs(await treasury.getAddress(), ethers.ZeroAddress, user1.address, SILVER_TOKEN_ID, 1);

      // 验证 USDT 转移
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUserUSDTBalance - purchaseAmount);
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(initialTreasuryBalance + purchaseAmount);

      // 验证 NFT 铸造
      expect(await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID)).to.equal(initialNFTBalance + 1n);

      // 验证投资记录
      const userInvestments = await treasury.getUserInvestments(user1.address);
      expect(userInvestments).to.equal(purchaseAmount);
    });

    it("Should handle multiple users purchasing different products", async function () {
      const silverAmount = ethers.parseUnits("500", 6);
      const goldAmount = ethers.parseUnits("2000", 6);
      const diamondAmount = ethers.parseUnits("8000", 6);

      // 用户1购买银卡
      await treasury.connect(user1).purchaseProduct(SILVER, silverAmount);
      expect(await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID)).to.equal(1);

      // 用户2购买金卡
      await treasury.connect(user2).purchaseProduct(GOLD, goldAmount);
      expect(await qaCard.balanceOf(user2.address, GOLD_TOKEN_ID)).to.equal(1);

      // 用户3购买钻石卡
      await treasury.connect(user3).purchaseProduct(DIAMOND, diamondAmount);
      expect(await qaCard.balanceOf(user3.address, DIAMOND_TOKEN_ID)).to.equal(1);

      // 验证总体状态
      const totalBalance = await mockUSDT.balanceOf(await treasury.getAddress());
      expect(totalBalance).to.equal(silverAmount + goldAmount + diamondAmount);

      // 验证每个用户的投资记录
      expect(await treasury.getUserInvestments(user1.address)).to.equal(silverAmount);
      expect(await treasury.getUserInvestments(user2.address)).to.equal(goldAmount);
      expect(await treasury.getUserInvestments(user3.address)).to.equal(diamondAmount);
    });

    it("Should allow users to purchase multiple products", async function () {
      const silverAmount = ethers.parseUnits("500", 6);
      const goldAmount = ethers.parseUnits("2000", 6);

      // 用户1先购买银卡
      await treasury.connect(user1).purchaseProduct(SILVER, silverAmount);
      
      // 然后购买金卡
      await treasury.connect(user1).purchaseProduct(GOLD, goldAmount);

      // 验证NFT余额
      expect(await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID)).to.equal(1);
      expect(await qaCard.balanceOf(user1.address, GOLD_TOKEN_ID)).to.equal(1);

      // 验证投资记录
      const userInvestments = await treasury.getUserInvestments(user1.address);
      expect(userInvestments).to.equal(silverAmount + goldAmount);

      // 验证USDT余额
      const expectedBalance = USER_USDT_AMOUNT - silverAmount - goldAmount;
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(expectedBalance);
    });

    it("Should allow users to purchase same product multiple times", async function () {
      const purchaseAmount = ethers.parseUnits("500", 6);
      const productType = SILVER;

      // 购买3次
      await treasury.connect(user1).purchaseProduct(productType, purchaseAmount);
      await treasury.connect(user1).purchaseProduct(productType, purchaseAmount);
      await treasury.connect(user1).purchaseProduct(productType, purchaseAmount);

      // 验证NFT数量
      expect(await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID)).to.equal(3);

      // 验证投资记录 - getUserInvestments returns total amount
      const userInvestments = await treasury.getUserInvestments(user1.address);
      expect(userInvestments).to.equal(purchaseAmount * 3n); // Total of 3 purchases

      // 验证总金额
      const totalSpent = purchaseAmount * 3n;
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(USER_USDT_AMOUNT - totalSpent);
    });
  });

  describe("Withdrawal and Treasury Management", function () {
    beforeEach(async function () {
      // 添加一些资金到 Treasury
      await treasury.connect(user1).purchaseProduct(GOLD, ethers.parseUnits("5000", 6));
      await treasury.connect(user2).purchaseProduct(DIAMOND, ethers.parseUnits("10000", 6));
    });

    it("Should allow owner to withdraw funds within daily limit", async function () {
      const withdrawAmount = ethers.parseUnits("5000", 6); // 在每日限额内
      const initialOwnerBalance = await mockUSDT.balanceOf(owner.address);
      const initialTreasuryBalance = await mockUSDT.balanceOf(await treasury.getAddress());

      await expect(treasury.connect(owner).withdraw(withdrawAmount))
        .to.emit(treasury, "Withdrawal")
        .withArgs(owner.address, withdrawAmount, owner.address, anyValue, anyValue)
        .and.to.emit(mockUSDT, "Transfer")
        .withArgs(await treasury.getAddress(), owner.address, withdrawAmount);

      expect(await mockUSDT.balanceOf(owner.address)).to.equal(initialOwnerBalance + withdrawAmount);
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(initialTreasuryBalance - withdrawAmount);
    });

    it("Should prevent withdrawal exceeding daily limit", async function () {
      const excessiveAmount = ethers.parseUnits("12000", 6); // 超过默认每日限额

      await expect(
        treasury.connect(owner).withdraw(excessiveAmount)
      ).to.be.revertedWithCustomError(treasury, "ExceedsWithdrawLimit");
    });

    it("Should allow operator to update withdrawal limits", async function () {
      const newLimit = ethers.parseUnits("20000", 6);
      const testWithdrawAmount = ethers.parseUnits("15000", 6);

      // 更新限额
      await treasury.connect(operator).updateDailyWithdrawalLimit(newLimit);

      // 在新限额内提取应该成功
      await expect(treasury.connect(owner).withdraw(testWithdrawAmount)).not.to.be.reverted;
    });

    it("Should handle emergency withdrawal correctly", async function () {
      const treasuryBalance = await mockUSDT.balanceOf(await treasury.getAddress());
      const initialOwnerBalance = await mockUSDT.balanceOf(owner.address);

      await treasury.connect(owner).emergencyWithdraw();

      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(0);
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(initialOwnerBalance + treasuryBalance);
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
      const initialTreasuryBalance = await mockUSDT.balanceOf(await treasury.getAddress());
      const initialUserBalance = await mockUSDT.balanceOf(user1.address);

      // 确保用户有足够的授权
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), totalAmount);

      await expect(treasury.connect(user1).batchDeposit(amounts, orderIds))
        .to.emit(treasury, "BatchDeposit")
        .withArgs(user1.address, totalAmount, amounts.length);

      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(initialTreasuryBalance + totalAmount);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialUserBalance - totalAmount);
    });

    it("Should allow batch NFT operations", async function () {
      // 确保用户有足够的USDT和授权
      const totalNeeded = ethers.parseUnits("10500", 6); // 500+2000+8000
      await mockUSDT.mint(user1.address, totalNeeded);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), totalNeeded);

      // 先购买多个产品以获得NFTs
      await treasury.connect(user1).purchaseProduct(SILVER, ethers.parseUnits("500", 6));
      await treasury.connect(user1).purchaseProduct(GOLD, ethers.parseUnits("2000", 6));
      await treasury.connect(user1).purchaseProduct(DIAMOND, ethers.parseUnits("8000", 6));

      // 设置tokens为可转移
      await qaCard.setTokenInfo(SILVER_TOKEN_ID, "Silver Card", "SILVER", 10000, true, true);
      await qaCard.setTokenInfo(GOLD_TOKEN_ID, "Gold Card", "GOLD", 5000, true, true);
      await qaCard.setTokenInfo(DIAMOND_TOKEN_ID, "Diamond Card", "DIAMOND", 1000, true, true);

      const tokenIds = [SILVER_TOKEN_ID, GOLD_TOKEN_ID, DIAMOND_TOKEN_ID];
      const amounts = [1, 1, 1];

      // 验证批量余额查询
      const balances = await qaCard.balanceOfBatch(
        [user1.address, user1.address, user1.address],
        tokenIds
      );

      expect(balances[0]).to.equal(1); // Silver
      expect(balances[1]).to.equal(1); // Gold
      expect(balances[2]).to.equal(1); // Diamond

      // 设置批量授权
      await qaCard.connect(user1).setApprovalForAll(user2.address, true);

      // 批量转移
      await expect(
        qaCard.connect(user2).safeBatchTransferFrom(
          user1.address,
          user3.address,
          tokenIds,
          amounts,
          "0x"
        )
      ).to.emit(qaCard, "TransferBatch");

      // 验证转移结果
      const newBalances = await qaCard.balanceOfBatch(
        [user3.address, user3.address, user3.address],
        tokenIds
      );

      expect(newBalances[0]).to.equal(1);
      expect(newBalances[1]).to.equal(1);
      expect(newBalances[2]).to.equal(1);
    });
  });

  describe("Error Handling and Edge Cases", function () {
    it("Should handle insufficient USDT balance gracefully", async function () {
      const largeAmount = ethers.parseUnits("20000", 6); // 超过用户余额

      await expect(
        treasury.connect(user1).purchaseProduct(SILVER, largeAmount)
      ).to.be.reverted;
    });

    it("Should handle insufficient allowance gracefully", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);
      
      // 重置授权为0
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), 0);

      await expect(
        treasury.connect(user1).purchaseProduct(SILVER, purchaseAmount)
      ).to.be.reverted;
    });

    it("Should prevent unauthorized operations", async function () {
      // 未授权的用户尝试从Treasury提取
      await expect(
        treasury.connect(user1).withdraw(ethers.parseUnits("1000", 6))
      ).to.be.reverted;

      // 未授权的用户尝试铸造NFT
      await expect(
        qaCard.connect(user1).mint(user1.address, SILVER_TOKEN_ID, 1, "0x")
      ).to.be.reverted;

      // 未授权的用户尝试铸造USDT
      await expect(
        mockUSDT.connect(user1).mint(user1.address, ethers.parseUnits("1000", 6))
      ).to.be.reverted;
    });

    it("Should handle contract pausing correctly", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);

      // 暂停合约
      await treasury.connect(owner).pause();

      // 购买应该失败
      await expect(
        treasury.connect(user1).purchaseProduct(SILVER, purchaseAmount)
      ).to.be.reverted;

      // 取消暂停
      await treasury.connect(owner).unpause();

      // 现在购买应该成功
      await expect(
        treasury.connect(user1).purchaseProduct(SILVER, purchaseAmount)
      ).not.to.be.reverted;
    });
  });

  describe("Complex Scenario Tests", function () {
    it("Should handle high-volume trading scenario", async function () {
      // 模拟大量用户同时交易的场景
      const promises = [];

      // 给更多用户分配USDT
      for (let i = 4; i < 10; i++) {
        const user = (await ethers.getSigners())[i];
        await mockUSDT.mint(user.address, USER_USDT_AMOUNT);
        await mockUSDT.connect(user).approve(await treasury.getAddress(), USER_USDT_AMOUNT);
        
        // 异步购买产品
        promises.push(
          treasury.connect(user).purchaseProduct(SILVER, ethers.parseUnits("500", 6))
        );
      }

      // 等待所有交易完成
      await Promise.all(promises);

      // 验证Treasury余额
      const expectedBalance = ethers.parseUnits("3000", 6); // 6 users * 500 USDT
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(expectedBalance);
    });

    it("Should maintain consistency under rapid operations", async function () {
      const purchaseAmount = ethers.parseUnits("100", 6);
      
      // 快速连续购买
      for (let i = 0; i < 10; i++) {
        await treasury.connect(user1).purchaseProduct(SILVER, purchaseAmount);
      }

      // 验证状态一致性
      expect(await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID)).to.equal(10);
      const userInvestments = await treasury.getUserInvestments(user1.address);
      expect(userInvestments).to.equal(purchaseAmount * 10n); // Total of 10 purchases

      // 验证总金额
      const totalSpent = purchaseAmount * 10n;
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(USER_USDT_AMOUNT - totalSpent);
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(totalSpent);
    });

    it("Should handle mixed product purchases and transfers", async function () {
      // 确保用户有足够的USDT和授权
      const additionalAmount = ethers.parseUnits("20000", 6);
      await mockUSDT.mint(user1.address, additionalAmount);
      await mockUSDT.mint(user2.address, additionalAmount);
      await mockUSDT.connect(user1).approve(await treasury.getAddress(), additionalAmount);
      await mockUSDT.connect(user2).approve(await treasury.getAddress(), additionalAmount);

      // 用户1购买各种产品
      await treasury.connect(user1).purchaseProduct(SILVER, ethers.parseUnits("500", 6));
      await treasury.connect(user1).purchaseProduct(GOLD, ethers.parseUnits("2000", 6));

      // 用户2也购买产品
      await treasury.connect(user2).purchaseProduct(DIAMOND, ethers.parseUnits("8000", 6));

      // 设置SILVER token为可转移
      await qaCard.setTokenInfo(SILVER_TOKEN_ID, "Silver Card", "SILVER", 10000, true, true);

      // NFT转移
      await qaCard.connect(user1).safeTransferFrom(
        user1.address,
        user2.address,
        SILVER_TOKEN_ID,
        1,
        "0x"
      );

      // 验证最终状态
      expect(await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID)).to.equal(0);
      expect(await qaCard.balanceOf(user1.address, GOLD_TOKEN_ID)).to.equal(1);
      expect(await qaCard.balanceOf(user2.address, SILVER_TOKEN_ID)).to.equal(1);
      expect(await qaCard.balanceOf(user2.address, DIAMOND_TOKEN_ID)).to.equal(1);

      // Treasury余额应该保持正确
      const expectedTreasuryBalance = ethers.parseUnits("10500", 6);
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(expectedTreasuryBalance);
    });
  });

  describe("Gas Efficiency in Integration", function () {
    it("Should optimize gas usage in end-to-end flow", async function () {
      const purchaseAmount = ethers.parseUnits("1000", 6);
      
      const tx = await treasury.connect(user1).purchaseProduct(SILVER, purchaseAmount);
      const receipt = await tx.wait();

      // 完整流程（USDT转移 + NFT铸造）应该在合理的gas范围内
      expect(receipt?.gasUsed).to.be.lessThan(350000);
    });

    it("Should batch operations more efficiently than individual ones", async function () {
      const amounts = [
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("1000", 6)
      ];
      const orderIds = [
        ethers.keccak256(ethers.toUtf8Bytes("order1")),
        ethers.keccak256(ethers.toUtf8Bytes("order2")),
        ethers.keccak256(ethers.toUtf8Bytes("order3"))
      ];

      // 批量操作
      const batchTx = await treasury.connect(user1).batchDeposit(amounts, orderIds);
      const batchReceipt = await batchTx.wait();

      // 单个操作成本估算（假设）
      const estimatedIndividualCost = 80000 * 3; // 假设每个操作80k gas

      // 批量操作应该更高效
      expect(batchReceipt?.gasUsed).to.be.lessThan(estimatedIndividualCost);
    });
  });

  describe("System Resilience", function () {
    it("Should handle contract upgrade scenarios", async function () {
      // 记录当前状态
      const initialTreasuryBalance = await mockUSDT.balanceOf(await treasury.getAddress());
      
      // 购买一些产品
      await treasury.connect(user1).purchaseProduct(SILVER, ethers.parseUnits("1000", 6));
      
      // 模拟Treasury合约地址更新
      const newTreasuryAddress = user3.address; // 模拟新合约
      
      // 更新QACard中的Treasury地址
      await qaCard.setTreasury(newTreasuryAddress);
      
      // 验证新的minter角色分配
      expect(await qaCard.hasRole(await qaCard.MINTER_ROLE(), newTreasuryAddress)).to.be.true;
      // 注意：旧Treasury可能仍保留role，这在某些升级场景中是正常的
    });

    it("Should maintain data integrity during emergency operations", async function () {
      // 购买一些产品建立状态
      await treasury.connect(user1).purchaseProduct(SILVER, ethers.parseUnits("1000", 6));
      await treasury.connect(user2).purchaseProduct(GOLD, ethers.parseUnits("2000", 6));

      const preEmergencyTreasuryBalance = await mockUSDT.balanceOf(await treasury.getAddress());
      const preEmergencyUser1NFT = await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID);
      const preEmergencyUser2NFT = await qaCard.balanceOf(user2.address, GOLD_TOKEN_ID);

      // 紧急暂停
      await treasury.connect(owner).pause();

      // 紧急提取
      await treasury.connect(owner).emergencyWithdraw();

      // 验证NFT状态保持不变
      expect(await qaCard.balanceOf(user1.address, SILVER_TOKEN_ID)).to.equal(preEmergencyUser1NFT);
      expect(await qaCard.balanceOf(user2.address, GOLD_TOKEN_ID)).to.equal(preEmergencyUser2NFT);

      // 验证资金已被提取
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(0);
    });
  });

  // Helper function for anyValue matcher
  const anyValue = (value: any) => true;
});