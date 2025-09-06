// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev 模拟USDT代币 - 仅用于测试网络
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals = 6; // USDT使用6位小数

    constructor() ERC20("Mock USDT", "USDT") Ownable(msg.sender) {
        // 初始供应量：10亿USDT
        _mint(msg.sender, 1_000_000_000 * 10**6);
    }

    /**
     * @dev 返回代币小数位数
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev 铸造代币 (仅所有者)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev 销毁代币 (仅所有者)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev 批量转账 (节省Gas)
     */
    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev 免费获取测试USDT (每个地址每天最多1000 USDT)
     */
    mapping(address => uint256) public lastFaucetTime;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**6; // 1000 USDT
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown not passed"
        );
        
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @dev 检查地址是否可以使用水龙头
     */
    function canUseFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetTime[user] + FAUCET_COOLDOWN;
    }

    /**
     * @dev 获取下次可以使用水龙头的时间
     */
    function nextFaucetTime(address user) external view returns (uint256) {
        return lastFaucetTime[user] + FAUCET_COOLDOWN;
    }

    /**
     * @dev 增加授权额度
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev 减少授权额度
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }
        return true;
    }
}