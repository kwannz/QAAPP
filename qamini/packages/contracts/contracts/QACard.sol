// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title QACard
 * @dev ERC1155 NFT合约 - 投资产品权益凭证
 * 
 * Token ID 映射:
 * - 1: 银卡 (Silver Card)
 * - 2: 金卡 (Gold Card)  
 * - 3: 钻石卡 (Diamond Card)
 * 
 * 功能特性:
 * - ERC1155多代币标准
 * - 权益NFT铸造和销毁
 * - 转移限制控制
 * - 批量操作支持
 * - 动态元数据更新
 */
contract QACard is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable,
    UUPSUpgradeable
{
    // 角色定义
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");

    // 代币信息
    struct TokenInfo {
        string name;
        string symbol;
        uint256 maxSupply;
        bool transferable;
        bool active;
    }

    // 状态变量
    mapping(uint256 => TokenInfo) public tokenInfo;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => bool) public authorizedOperators;
    address private _treasury;
    address private _owner;

    // 用户持仓记录
    mapping(address => mapping(uint256 => uint256[])) public userTokens;
    mapping(uint256 => address) public tokenOwners;
    uint256 private _currentTokenIndex;

    // 事件定义
    event TokenMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 amount,
        bytes32 indexed orderId,
        uint256 uniqueId
    );

    event TokenBurned(
        address indexed from,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 uniqueId
    );

    event TokenInfoUpdated(
        uint256 indexed tokenId,
        string name,
        string symbol,
        uint256 maxSupply,
        bool transferable
    );

    event URIUpdated(uint256 indexed tokenId, string uri);

    event OperatorAuthorized(address indexed operator, bool authorized);

    // 错误定义
    error InsufficientSupply(uint256 requested, uint256 available);
    error TokenNotActive(uint256 tokenId);
    error TransferNotAllowed(uint256 tokenId);
    error InvalidTokenId(uint256 tokenId);
    error UnauthorizedOperator(address operator);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // For testing purposes, allow initialization
        // _disableInitializers();
    }

    /**
     * @dev 初始化合约
     * @param _uri 基础URI
     * @param admin 管理员地址
     */
    function initialize(string memory _uri, address admin) public initializer {
        __ERC1155_init(_uri);
        __AccessControl_init();
        __Pausable_init();
        __ERC1155Burnable_init();
        __ERC1155Supply_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(URI_SETTER_ROLE, admin);

        _owner = admin;

        // 初始化代币信息
        _initializeTokens();
    }

    /**
     * @dev 初始化预设的代币类型
     */
    function _initializeTokens() internal {
        // 银卡 - Token ID: 1
        tokenInfo[1] = TokenInfo({
            name: "Silver Card",
            symbol: "SILVER",
            maxSupply: 10000,
            transferable: false,
            active: true
        });

        // 金卡 - Token ID: 2
        tokenInfo[2] = TokenInfo({
            name: "Gold Card", 
            symbol: "GOLD",
            maxSupply: 5000,
            transferable: false,
            active: true
        });

        // 钻石卡 - Token ID: 3
        tokenInfo[3] = TokenInfo({
            name: "Diamond Card",
            symbol: "DIAMOND",
            maxSupply: 1000,
            transferable: false,
            active: true
        });
    }

    /**
     * @dev 标准铸造NFT (测试用)
     * @param to 接收地址
     * @param tokenId 代币ID
     * @param amount 数量 (通常为1)
     * @param data 额外数据
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        TokenInfo storage token = tokenInfo[tokenId];
        
        if (!token.active) revert TokenNotActive(tokenId);
        
        uint256 currentSupply = totalSupply(tokenId);
        if (currentSupply + amount > token.maxSupply) {
            revert InsufficientSupply(amount, token.maxSupply - currentSupply);
        }

        // 生成唯一ID
        uint256 uniqueId = _generateUniqueId(tokenId, to);

        // 铸造NFT
        _mint(to, tokenId, amount, data);

        // 记录用户持仓
        userTokens[to][tokenId].push(uniqueId);
        tokenOwners[uniqueId] = to;

        emit TokenMinted(to, tokenId, amount, bytes32(uniqueId), uniqueId);
    }

    /**
     * @dev 铸造NFT (带订单ID)
     * @param to 接收地址
     * @param tokenId 代币ID
     * @param amount 数量 (通常为1)
     * @param orderId 订单ID
     * @param data 额外数据
     */
    function mintWithOrderId(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes32 orderId,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        TokenInfo storage token = tokenInfo[tokenId];
        
        if (!token.active) revert TokenNotActive(tokenId);
        
        uint256 currentSupply = totalSupply(tokenId);
        if (currentSupply + amount > token.maxSupply) {
            revert InsufficientSupply(amount, token.maxSupply - currentSupply);
        }

        // 生成唯一ID
        uint256 uniqueId = _generateUniqueId(tokenId, to);

        // 铸造NFT
        _mint(to, tokenId, amount, data);

        // 记录用户持仓
        userTokens[to][tokenId].push(uniqueId);
        tokenOwners[uniqueId] = to;

        emit TokenMinted(to, tokenId, amount, orderId, uniqueId);
    }

    /**
     * @dev 批量铸造NFT
     * @param to 接收地址
     * @param tokenIds 代币ID数组
     * @param amounts 数量数组
     * @param orderIds 订单ID数组
     * @param data 额外数据
     */
    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        bytes32[] memory orderIds,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(tokenIds.length == orderIds.length, "Array length mismatch");

        for (uint i = 0; i < tokenIds.length; i++) {
            TokenInfo storage token = tokenInfo[tokenIds[i]];
            if (!token.active) revert TokenNotActive(tokenIds[i]);
            
            uint256 currentSupply = totalSupply(tokenIds[i]);
            if (currentSupply + amounts[i] > token.maxSupply) {
                revert InsufficientSupply(amounts[i], token.maxSupply - currentSupply);
            }
        }

        _mintBatch(to, tokenIds, amounts, data);

        // 记录批量铸造事件
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 uniqueId = _generateUniqueId(tokenIds[i], to);
            userTokens[to][tokenIds[i]].push(uniqueId);
            tokenOwners[uniqueId] = to;
            
            emit TokenMinted(to, tokenIds[i], amounts[i], orderIds[i], uniqueId);
        }
    }

    /**
     * @dev 为Treasury合约提供的特殊铸造函数
     * @param to 接收地址
     * @param productType 产品类型 (从Treasury.sol导入的枚举)
     */
    function mintCard(
        address to,
        uint8 productType, // 0=SILVER, 1=GOLD, 2=DIAMOND, 3=PLATINUM
        uint256 /* amount */,
        uint256 /* apr */,
        uint256 /* duration */
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        // 映射产品类型到token ID (加1因为我们的token IDs从1开始)
        uint256 tokenId = uint256(productType) + 1;
        
        TokenInfo storage token = tokenInfo[tokenId];
        if (!token.active) revert TokenNotActive(tokenId);
        
        uint256 currentSupply = totalSupply(tokenId);
        if (currentSupply + 1 > token.maxSupply) {
            revert InsufficientSupply(1, token.maxSupply - currentSupply);
        }

        // 生成唯一ID作为返回值
        uint256 uniqueId = _generateUniqueId(tokenId, to);
        
        // 铸造NFT (数量为1)
        _mint(to, tokenId, 1, "");
        
        // 记录用户拥有的token
        userTokens[to][tokenId].push(uniqueId);
        tokenOwners[uniqueId] = to;
        
        // 可以在这里存储投资相关信息到链上（如果需要）
        // 例如: tokenInvestmentInfo[uniqueId] = InvestmentInfo(amount, apr, duration, block.timestamp);
        
        emit TokenMinted(to, tokenId, 1, bytes32(uniqueId), uniqueId);
        
        return uniqueId;
    }

    /**
     * @dev 销毁NFT (到期赎回时调用)
     * @param from 持有者地址
     * @param tokenId 代币ID
     * @param amount 数量
     */
    function burnFrom(
        address from,
        uint256 tokenId,
        uint256 amount
    ) public {
        require(
            from == _msgSender() || 
            isApprovedForAll(from, _msgSender()) || 
            hasRole(MINTER_ROLE, _msgSender()),
            "Caller is not owner nor approved"
        );

        // 找到并移除对应的唯一ID
        uint256[] storage tokens = userTokens[from][tokenId];
        if (tokens.length > 0) {
            uint256 uniqueId = tokens[tokens.length - 1];
            tokens.pop();
            delete tokenOwners[uniqueId];
            
            emit TokenBurned(from, tokenId, amount, uniqueId);
        }

        burn(from, tokenId, amount);
    }

    /**
     * @dev 设置代币信息
     * @param tokenId 代币ID
     * @param name 代币名称
     * @param symbol 代币符号
     * @param maxSupply 最大供应量
     * @param transferable 是否可转移
     * @param active 是否激活
     */
    function setTokenInfo(
        uint256 tokenId,
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        bool transferable,
        bool active
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        TokenInfo storage token = tokenInfo[tokenId];
        
        // 最大供应量不能小于当前供应量
        uint256 currentSupply = totalSupply(tokenId);
        require(maxSupply >= currentSupply, "Max supply too low");

        token.name = name;
        token.symbol = symbol;
        token.maxSupply = maxSupply;
        token.transferable = transferable;
        token.active = active;

        emit TokenInfoUpdated(tokenId, name, symbol, maxSupply, transferable);
    }

    /**
     * @dev 设置代币URI
     * @param tokenId 代币ID
     * @param tokenURI 代币URI
     */
    function setTokenURI(
        uint256 tokenId,
        string memory tokenURI
    ) public onlyRole(URI_SETTER_ROLE) {
        _tokenURIs[tokenId] = tokenURI;
        emit URIUpdated(tokenId, tokenURI);
    }

    /**
     * @dev 设置授权操作员
     * @param operator 操作员地址
     * @param authorized 是否授权
     */
    function setAuthorizedOperator(
        address operator,
        bool authorized
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedOperators[operator] = authorized;
        emit OperatorAuthorized(operator, authorized);
    }

    /**
     * @dev 暂停合约
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev 恢复合约
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev 获取代币URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        
        // 如果设置了特定的tokenURI，返回它；否则返回基础URI + tokenId
        return bytes(tokenURI).length > 0 ? tokenURI : super.uri(tokenId);
    }

    /**
     * @dev 获取用户持有的代币列表
     * @param user 用户地址
     * @param tokenId 代币ID
     */
    function getUserTokens(
        address user,
        uint256 tokenId
    ) public view returns (uint256[] memory) {
        return userTokens[user][tokenId];
    }

    /**
     * @dev 获取代币详细信息
     * @param tokenId 代币ID
     */
    function getTokenInfo(uint256 tokenId) public view returns (
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 currentSupply,
        bool transferable,
        bool active
    ) {
        TokenInfo storage token = tokenInfo[tokenId];
        return (
            token.name,
            token.symbol,
            token.maxSupply,
            totalSupply(tokenId),
            token.transferable,
            token.active
        );
    }

    /**
     * @dev 生成唯一ID
     */
    function _generateUniqueId(uint256 tokenId, address to) internal returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            tokenId,
            to,
            block.timestamp,
            _currentTokenIndex++
        )));
    }

    /**
     * @dev 重写token更新检查
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) whenNotPaused {
        // 检查转移限制
        for (uint i = 0; i < ids.length; i++) {
            // 铸造和销毁总是允许的
            if (from != address(0) && to != address(0)) {
                if (!tokenInfo[ids[i]].transferable && !authorizedOperators[_msgSender()]) {
                    revert TransferNotAllowed(ids[i]);
                }
            }
        }

        super._update(from, to, ids, amounts);
    }

    /**
     * @dev 设置Treasury地址 (测试需要)
     */
    function setTreasury(address treasuryAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldTreasury = _treasury;
        _treasury = treasuryAddress;
        
        // 如果有旧的Treasury，撤销其MINTER权限
        if (oldTreasury != address(0)) {
            _revokeRole(MINTER_ROLE, oldTreasury);
        }
        
        // 给新Treasury授予MINTER权限
        if (treasuryAddress != address(0)) {
            _grantRole(MINTER_ROLE, treasuryAddress);
        }
    }

    /**
     * @dev 获取Treasury地址
     */
    function treasury() public view returns (address) {
        return _treasury;
    }

    /**
     * @dev 获取合约所有者 (测试需要)
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev 设置URI (测试需要)
     */
    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    /**
     * @dev 支持接口检查
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev UUPS 升级授权检查
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(DEFAULT_ADMIN_ROLE)
        override
    {}
}