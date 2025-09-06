// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./QACard.sol";

/**
 * @title YieldDistributor
 * @dev 收益分发合约 - 自动化分发每日收益给持仓用户
 * 
 * 功能特性:
 * - 自动化每日收益分发
 * - 批量分发优化Gas成本
 * - 分发历史记录和审计
 * - 紧急暂停机制
 * - 多重签名控制
 */
contract YieldDistributor is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // 角色定义
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // 收益分发记录
    struct YieldRecord {
        address user;           // 用户地址
        uint256 amount;         // 收益金额
        uint256 positionId;     // 持仓ID (来自链下)
        uint256 distributionDate; // 分发日期 (timestamp)
        uint256 blockNumber;    // 区块号
        bytes32 batchId;        // 批次ID
        bool claimed;           // 是否已领取
        uint256 claimedAt;      // 领取时间
    }

    // 批次分发信息
    struct DistributionBatch {
        bytes32 batchId;        // 批次ID
        uint256 totalAmount;    // 总分发金额
        uint256 totalRecords;   // 分发记录数量
        uint256 completedAt;    // 完成时间
        address operator;       // 操作员
        bool isCompleted;       // 是否完成
    }

    // 用户累计收益信息
    struct UserYieldInfo {
        uint256 totalEarned;    // 总收益
        uint256 totalClaimed;   // 已领取
        uint256 availableToClean; // 可领取
        uint256 lastClaimAt;    // 最后领取时间
        uint256[] recordIds;    // 收益记录ID列表
    }

    // 状态变量
    IERC20 public usdtToken;
    QACard public qaCard;
    
    // 收益记录映射
    mapping(uint256 => YieldRecord) public yieldRecords;
    mapping(bytes32 => DistributionBatch) public distributionBatches;
    mapping(address => UserYieldInfo) public userYieldInfo;
    mapping(address => mapping(uint256 => bool)) public dailyDistributed; // user => day => distributed
    
    uint256 public totalRecordCount;
    uint256 public totalDistributed;
    uint256 public totalClaimed;
    
    // 分发配置
    uint256 public maxBatchSize = 200;  // 单批次最大分发数量
    uint256 public minDistributionAmount = 1e4; // 最小分发金额 (0.01 USDT)
    uint256 public distributionFee = 0; // 分发手续费 (基点)
    
    // 事件定义
    event YieldDistributed(
        address indexed user,
        uint256 indexed recordId,
        uint256 amount,
        uint256 positionId,
        bytes32 indexed batchId,
        uint256 timestamp
    );
    
    event YieldClaimed(
        address indexed user,
        uint256[] recordIds,
        uint256 totalAmount,
        uint256 timestamp
    );
    
    event BatchDistributionStarted(
        bytes32 indexed batchId,
        uint256 totalAmount,
        uint256 recordCount,
        address indexed operator
    );
    
    event BatchDistributionCompleted(
        bytes32 indexed batchId,
        uint256 completedAt,
        bool success
    );
    
    event DistributionConfigUpdated(
        uint256 maxBatchSize,
        uint256 minDistributionAmount,
        uint256 distributionFee
    );

    event EmergencyWithdraw(
        address indexed token,
        address indexed to,
        uint256 amount,
        address indexed operator
    );

    // 错误定义
    error InvalidAmount();
    error InsufficientFunds(uint256 requested, uint256 available);
    error BatchSizeExceeded(uint256 provided, uint256 maximum);
    error AlreadyDistributed(address user, uint256 day);
    error NothingToClaim(address user);
    error InvalidBatchId(bytes32 batchId);
    error BatchNotCompleted(bytes32 batchId);
    error RecordNotFound(uint256 recordId);
    error UnauthorizedAccess();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // _disableInitializers();
    }

    /**
     * @dev 初始化合约
     * @param _usdtToken USDT代币合约地址
     * @param _qaCard QACard NFT合约地址
     * @param _admin 管理员地址
     * @param _distributors 分发员地址数组
     */
    function initialize(
        address _usdtToken,
        address _qaCard,
        address _admin,
        address[] memory _distributors
    ) public initializer {
        require(_usdtToken != address(0), "Invalid USDT address");
        require(_qaCard != address(0), "Invalid QACard address");
        require(_admin != address(0), "Invalid admin address");

        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        usdtToken = IERC20(_usdtToken);
        qaCard = QACard(_qaCard);

        // 设置角色
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);

        // 授权分发员角色
        for (uint i = 0; i < _distributors.length; i++) {
            _grantRole(DISTRIBUTOR_ROLE, _distributors[i]);
        }
    }

    /**
     * @dev 批量分发收益
     * @param users 用户地址数组
     * @param amounts 收益金额数组
     * @param positionIds 持仓ID数组
     * @param batchId 批次ID
     */
    function batchDistributeYield(
        address[] calldata users,
        uint256[] calldata amounts,
        uint256[] calldata positionIds,
        bytes32 batchId
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant {
        require(users.length == amounts.length && amounts.length == positionIds.length, 
                "Array length mismatch");
        
        if (users.length > maxBatchSize) {
            revert BatchSizeExceeded(users.length, maxBatchSize);
        }
        
        if (users.length == 0) revert InvalidAmount();
        
        // 检查批次是否已存在
        require(!distributionBatches[batchId].isCompleted, "Batch already completed");
        
        uint256 totalAmount = 0;
        uint256 today = block.timestamp / 86400; // 当天的天数
        
        // 验证金额并检查重复分发
        for (uint i = 0; i < users.length; i++) {
            if (amounts[i] < minDistributionAmount) revert InvalidAmount();
            
            // 检查今日是否已分发
            if (dailyDistributed[users[i]][today]) {
                revert AlreadyDistributed(users[i], today);
            }
            
            totalAmount += amounts[i];
        }
        
        // 检查合约余额是否足够
        uint256 contractBalance = usdtToken.balanceOf(address(this));
        if (contractBalance < totalAmount) {
            revert InsufficientFunds(totalAmount, contractBalance);
        }
        
        // 创建或更新批次信息
        if (distributionBatches[batchId].batchId == bytes32(0)) {
            distributionBatches[batchId] = DistributionBatch({
                batchId: batchId,
                totalAmount: 0,
                totalRecords: 0,
                completedAt: 0,
                operator: msg.sender,
                isCompleted: false
            });
            
            emit BatchDistributionStarted(batchId, totalAmount, users.length, msg.sender);
        }
        
        // 执行分发
        for (uint i = 0; i < users.length; i++) {
            _distributeYieldToUser(
                users[i],
                amounts[i],
                positionIds[i],
                batchId,
                today
            );
        }
        
        // 更新批次信息
        DistributionBatch storage batch = distributionBatches[batchId];
        batch.totalAmount += totalAmount;
        batch.totalRecords += users.length;
        
        // 更新全局统计
        totalDistributed += totalAmount;
    }

    /**
     * @dev 完成批次分发
     * @param batchId 批次ID
     */
    function completeBatchDistribution(
        bytes32 batchId
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        DistributionBatch storage batch = distributionBatches[batchId];
        
        if (batch.batchId == bytes32(0)) revert InvalidBatchId(batchId);
        require(!batch.isCompleted, "Batch already completed");
        
        batch.isCompleted = true;
        batch.completedAt = block.timestamp;
        
        emit BatchDistributionCompleted(batchId, batch.completedAt, true);
    }

    /**
     * @dev 内部函数：分发收益给单个用户
     */
    function _distributeYieldToUser(
        address user,
        uint256 amount,
        uint256 positionId,
        bytes32 batchId,
        uint256 today
    ) internal {
        // 创建收益记录
        uint256 recordId = totalRecordCount++;
        yieldRecords[recordId] = YieldRecord({
            user: user,
            amount: amount,
            positionId: positionId,
            distributionDate: block.timestamp,
            blockNumber: block.number,
            batchId: batchId,
            claimed: false,
            claimedAt: 0
        });
        
        // 更新用户收益信息
        UserYieldInfo storage userInfo = userYieldInfo[user];
        userInfo.totalEarned += amount;
        userInfo.availableToClean += amount;
        userInfo.recordIds.push(recordId);
        
        // 标记今日已分发
        dailyDistributed[user][today] = true;
        
        emit YieldDistributed(user, recordId, amount, positionId, batchId, block.timestamp);
    }

    /**
     * @dev 用户领取收益
     * @param recordIds 收益记录ID数组
     */
    function claimYield(
        uint256[] calldata recordIds
    ) external whenNotPaused nonReentrant {
        require(recordIds.length > 0, "No records to claim");
        
        uint256 totalClaimAmount = 0;
        address user = msg.sender;
        
        // 验证并计算总领取金额
        for (uint i = 0; i < recordIds.length; i++) {
            YieldRecord storage record = yieldRecords[recordIds[i]];
            
            if (record.user == address(0)) revert RecordNotFound(recordIds[i]);
            require(record.user == user, "Not record owner");
            require(!record.claimed, "Already claimed");
            
            totalClaimAmount += record.amount;
        }
        
        if (totalClaimAmount == 0) revert NothingToClaim(user);
        
        // 检查合约余额
        uint256 contractBalance = usdtToken.balanceOf(address(this));
        if (contractBalance < totalClaimAmount) {
            revert InsufficientFunds(totalClaimAmount, contractBalance);
        }
        
        // 更新记录状态
        for (uint i = 0; i < recordIds.length; i++) {
            YieldRecord storage record = yieldRecords[recordIds[i]];
            record.claimed = true;
            record.claimedAt = block.timestamp;
        }
        
        // 更新用户信息
        UserYieldInfo storage userInfo = userYieldInfo[user];
        userInfo.totalClaimed += totalClaimAmount;
        userInfo.availableToClean -= totalClaimAmount;
        userInfo.lastClaimAt = block.timestamp;
        
        // 转账USDT
        usdtToken.safeTransfer(user, totalClaimAmount);
        
        // 更新全局统计
        totalClaimed += totalClaimAmount;
        
        emit YieldClaimed(user, recordIds, totalClaimAmount, block.timestamp);
    }

    /**
     * @dev 一键领取所有可领取收益
     */
    function claimAllAvailable() external whenNotPaused nonReentrant {
        address user = msg.sender;
        UserYieldInfo storage userInfo = userYieldInfo[user];
        
        if (userInfo.availableToClean == 0) revert NothingToClaim(user);
        
        // 收集所有未领取的记录
        uint256[] memory unclaimedRecords = new uint256[](userInfo.recordIds.length);
        uint256 unclaimedCount = 0;
        uint256 totalAmount = 0;
        
        for (uint i = 0; i < userInfo.recordIds.length; i++) {
            uint256 recordId = userInfo.recordIds[i];
            YieldRecord storage record = yieldRecords[recordId];
            
            if (!record.claimed) {
                unclaimedRecords[unclaimedCount] = recordId;
                unclaimedCount++;
                totalAmount += record.amount;
            }
        }
        
        if (unclaimedCount == 0) revert NothingToClaim(user);
        
        // 创建正确大小的数组
        uint256[] memory recordIds = new uint256[](unclaimedCount);
        for (uint i = 0; i < unclaimedCount; i++) {
            recordIds[i] = unclaimedRecords[i];
        }
        
        // 调用标准领取函数
        this.claimYield(recordIds);
    }

    /**
     * @dev 获取用户收益信息
     * @param user 用户地址
     */
    function getUserYieldInfo(address user) external view returns (
        uint256 totalEarned,
        uint256 totalClaimed,
        uint256 availableToClean,
        uint256 lastClaimAt,
        uint256 recordCount
    ) {
        UserYieldInfo storage userInfo = userYieldInfo[user];
        return (
            userInfo.totalEarned,
            userInfo.totalClaimed,
            userInfo.availableToClean,
            userInfo.lastClaimAt,
            userInfo.recordIds.length
        );
    }

    /**
     * @dev 获取用户未领取的收益记录
     * @param user 用户地址
     * @param limit 返回数量限制
     */
    function getUserUnclaimedRecords(
        address user, 
        uint256 limit
    ) external view returns (uint256[] memory recordIds, uint256[] memory amounts) {
        UserYieldInfo storage userInfo = userYieldInfo[user];
        
        // 统计未领取记录数量
        uint256 unclaimedCount = 0;
        for (uint i = 0; i < userInfo.recordIds.length; i++) {
            if (!yieldRecords[userInfo.recordIds[i]].claimed) {
                unclaimedCount++;
            }
        }
        
        if (unclaimedCount == 0) {
            return (new uint256[](0), new uint256[](0));
        }
        
        // 限制返回数量
        uint256 returnCount = unclaimedCount > limit ? limit : unclaimedCount;
        recordIds = new uint256[](returnCount);
        amounts = new uint256[](returnCount);
        
        uint256 index = 0;
        for (uint i = 0; i < userInfo.recordIds.length && index < returnCount; i++) {
            uint256 recordId = userInfo.recordIds[i];
            YieldRecord storage record = yieldRecords[recordId];
            
            if (!record.claimed) {
                recordIds[index] = recordId;
                amounts[index] = record.amount;
                index++;
            }
        }
    }

    /**
     * @dev 获取批次信息
     * @param batchId 批次ID
     */
    function getBatchInfo(bytes32 batchId) external view returns (
        uint256 totalAmount,
        uint256 totalRecords,
        uint256 completedAt,
        address operator,
        bool isCompleted
    ) {
        DistributionBatch storage batch = distributionBatches[batchId];
        return (
            batch.totalAmount,
            batch.totalRecords,
            batch.completedAt,
            batch.operator,
            batch.isCompleted
        );
    }

    /**
     * @dev 获取收益记录详情
     * @param recordId 记录ID
     */
    function getYieldRecord(uint256 recordId) external view returns (
        address user,
        uint256 amount,
        uint256 positionId,
        uint256 distributionDate,
        uint256 blockNumber,
        bytes32 batchId,
        bool claimed,
        uint256 claimedAt
    ) {
        YieldRecord storage record = yieldRecords[recordId];
        return (
            record.user,
            record.amount,
            record.positionId,
            record.distributionDate,
            record.blockNumber,
            record.batchId,
            record.claimed,
            record.claimedAt
        );
    }

    /**
     * @dev 检查用户今日是否已分发
     * @param user 用户地址
     * @param day 天数 (可选，默认今天)
     */
    function isDailyDistributed(address user, uint256 day) external view returns (bool) {
        if (day == 0) {
            day = block.timestamp / 86400;
        }
        return dailyDistributed[user][day];
    }

    /**
     * @dev 更新分发配置
     * @param _maxBatchSize 最大批次大小
     * @param _minDistributionAmount 最小分发金额
     * @param _distributionFee 分发手续费
     */
    function updateDistributionConfig(
        uint256 _maxBatchSize,
        uint256 _minDistributionAmount,
        uint256 _distributionFee
    ) external onlyRole(OPERATOR_ROLE) {
        require(_maxBatchSize > 0 && _maxBatchSize <= 1000, "Invalid batch size");
        require(_distributionFee <= 500, "Fee too high"); // 最大5%
        
        maxBatchSize = _maxBatchSize;
        minDistributionAmount = _minDistributionAmount;
        distributionFee = _distributionFee;
        
        emit DistributionConfigUpdated(_maxBatchSize, _minDistributionAmount, _distributionFee);
    }

    /**
     * @dev 紧急提取资金
     * @param token 代币地址 (address(0) 表示 ETH)
     * @param to 接收地址
     * @param amount 提取金额
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        if (token == address(0)) {
            // 提取 ETH
            require(address(this).balance >= amount, "Insufficient ETH");
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            // 提取 ERC20 代币
            IERC20 tokenContract = IERC20(token);
            require(tokenContract.balanceOf(address(this)) >= amount, "Insufficient token");
            tokenContract.safeTransfer(to, amount);
        }
        
        emit EmergencyWithdraw(token, to, amount, msg.sender);
    }

    /**
     * @dev 暂停合约
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev 恢复合约
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev 获取合约统计信息
     */
    function getContractStats() external view returns (
        uint256 _totalRecordCount,
        uint256 _totalDistributed,
        uint256 _totalClaimed,
        uint256 _contractBalance,
        uint256 _activeRecords
    ) {
        return (
            totalRecordCount,
            totalDistributed,
            totalClaimed,
            usdtToken.balanceOf(address(this)),
            totalDistributed > totalClaimed ? totalDistributed - totalClaimed : 0
        );
    }

    /**
     * @dev 支持接收ETH
     */
    receive() external payable {}
}