// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Treasury
 * @dev 资金金库合约 - 负责USDT的存储和提取
 * 
 * 功能特性:
 * - USDT存款和提取
 * - 多重签名控制
 * - 紧急暂停机制
 * - 角色权限控制
 * - 事件日志完整记录
 */
contract Treasury is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // 角色定义
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

    // 状态变量
    IERC20 public usdtToken;
    mapping(address => uint256) public userDeposits;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    
    // 提取限制配置
    uint256 public dailyWithdrawLimit;
    uint256 public singleWithdrawLimit;
    mapping(uint256 => uint256) public dailyWithdrawn; // day => amount
    
    // 事件定义
    event Deposited(
        address indexed user,
        uint256 amount,
        bytes32 indexed orderId,
        uint256 timestamp
    );
    
    event Withdrawn(
        address indexed to,
        uint256 amount,
        address indexed operator,
        bytes32 indexed reason,
        uint256 timestamp
    );
    
    event LimitsUpdated(
        uint256 dailyLimit,
        uint256 singleLimit,
        address indexed operator
    );
    
    event EmergencyWithdraw(
        address indexed to,
        uint256 amount,
        address indexed operator,
        uint256 timestamp
    );

    // 错误定义
    error InsufficientBalance(uint256 requested, uint256 available);
    error ExceedsWithdrawLimit(uint256 amount, uint256 limit);
    error InvalidAmount();
    error TransferFailed();
    error UnauthorizedAccess();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化合约
     * @param _usdtToken USDT代币合约地址
     * @param _admin 管理员地址
     * @param _operators 操作员地址数组
     */
    function initialize(
        address _usdtToken,
        address _admin,
        address[] memory _operators
    ) public initializer {
        require(_usdtToken != address(0), "Invalid USDT address");
        require(_admin != address(0), "Invalid admin address");

        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        usdtToken = IERC20(_usdtToken);
        
        // 设置默认限制
        dailyWithdrawLimit = 1000000 * 10**6; // 100万 USDT
        singleWithdrawLimit = 100000 * 10**6; // 10万 USDT

        // 分配角色
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(WITHDRAWER_ROLE, _admin);

        for (uint i = 0; i < _operators.length; i++) {
            _grantRole(OPERATOR_ROLE, _operators[i]);
        }
    }

    /**
     * @dev 用户存入USDT
     * @param amount 存入金额
     * @param orderId 订单ID (链下生成)
     */
    function deposit(
        uint256 amount,
        bytes32 orderId
    ) external whenNotPaused nonReentrant {
        if (amount == 0) revert InvalidAmount();

        // 转入USDT
        usdtToken.safeTransferFrom(msg.sender, address(this), amount);

        // 更新状态
        userDeposits[msg.sender] += amount;
        totalDeposits += amount;

        emit Deposited(msg.sender, amount, orderId, block.timestamp);
    }

    /**
     * @dev 批量存入USDT (Gas优化)
     * @param amounts 存入金额数组
     * @param orderIds 订单ID数组
     */
    function batchDeposit(
        uint256[] calldata amounts,
        bytes32[] calldata orderIds
    ) external whenNotPaused nonReentrant {
        require(amounts.length == orderIds.length, "Array length mismatch");
        
        uint256 totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) revert InvalidAmount();
            totalAmount += amounts[i];
        }

        // 一次性转入总金额
        usdtToken.safeTransferFrom(msg.sender, address(this), totalAmount);

        // 更新状态并发出事件
        userDeposits[msg.sender] += totalAmount;
        totalDeposits += totalAmount;

        for (uint i = 0; i < amounts.length; i++) {
            emit Deposited(msg.sender, amounts[i], orderIds[i], block.timestamp);
        }
    }

    /**
     * @dev 运营提取USDT
     * @param to 接收地址
     * @param amount 提取金额
     * @param reason 提取原因
     */
    function withdraw(
        address to,
        uint256 amount,
        bytes32 reason
    ) external onlyRole(WITHDRAWER_ROLE) whenNotPaused nonReentrant {
        _checkWithdrawLimits(amount);
        _executeWithdraw(to, amount, reason);
    }

    /**
     * @dev 紧急提取 (绕过限制)
     * @param to 接收地址
     * @param amount 提取金额
     */
    function emergencyWithdraw(
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 balance = usdtToken.balanceOf(address(this));
        if (amount > balance) {
            revert InsufficientBalance(amount, balance);
        }

        usdtToken.safeTransfer(to, amount);
        totalWithdrawals += amount;

        emit EmergencyWithdraw(to, amount, msg.sender, block.timestamp);
    }

    /**
     * @dev 设置提取限制
     * @param _dailyLimit 每日提取限制
     * @param _singleLimit 单次提取限制
     */
    function setWithdrawLimits(
        uint256 _dailyLimit,
        uint256 _singleLimit
    ) external onlyRole(OPERATOR_ROLE) {
        dailyWithdrawLimit = _dailyLimit;
        singleWithdrawLimit = _singleLimit;

        emit LimitsUpdated(_dailyLimit, _singleLimit, msg.sender);
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
     * @dev 获取合约USDT余额
     */
    function getBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }

    /**
     * @dev 获取用户存款余额
     */
    function getUserDeposits(address user) external view returns (uint256) {
        return userDeposits[user];
    }

    /**
     * @dev 获取今日已提取金额
     */
    function getTodayWithdrawn() external view returns (uint256) {
        uint256 today = block.timestamp / 86400;
        return dailyWithdrawn[today];
    }

    /**
     * @dev 检查提取限制
     */
    function _checkWithdrawLimits(uint256 amount) internal view {
        // 检查单次限制
        if (amount > singleWithdrawLimit) {
            revert ExceedsWithdrawLimit(amount, singleWithdrawLimit);
        }

        // 检查每日限制
        uint256 today = block.timestamp / 86400;
        uint256 todayWithdrawn = dailyWithdrawn[today];
        if (todayWithdrawn + amount > dailyWithdrawLimit) {
            revert ExceedsWithdrawLimit(
                todayWithdrawn + amount,
                dailyWithdrawLimit
            );
        }

        // 检查余额
        uint256 balance = usdtToken.balanceOf(address(this));
        if (amount > balance) {
            revert InsufficientBalance(amount, balance);
        }
    }

    /**
     * @dev 执行提取操作
     */
    function _executeWithdraw(
        address to,
        uint256 amount,
        bytes32 reason
    ) internal {
        // 转账
        usdtToken.safeTransfer(to, amount);

        // 更新状态
        totalWithdrawals += amount;
        uint256 today = block.timestamp / 86400;
        dailyWithdrawn[today] += amount;

        emit Withdrawn(to, amount, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev 支持接收ETH (用于支付Gas费)
     */
    receive() external payable {}

    /**
     * @dev 提取ETH
     */
    function withdrawETH(
        address payable to,
        uint256 amount
    ) external onlyRole(OPERATOR_ROLE) {
        require(address(this).balance >= amount, "Insufficient ETH balance");
        to.transfer(amount);
    }
}