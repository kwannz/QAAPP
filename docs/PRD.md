# 概览（Executive Summary）

本规格说明用于指导 **React + Node.js/TypeScript + PostgreSQL/Prisma + Web3** 的全栈实现，围绕下述商业流程：

* C 端用户以 **USDT** 购买卡片（**银/金/钻石**），获得**按月固定收益**；
* 资金入 **Web3 钱包 → 量化交易**，收益回流后按月派发；
* **C2C 分享奖励 1%**、**代理奖励 3%**，分别从佣金池结算；
* 卡片以 **NFT（推荐 ERC‑1155）** 形式铸造/持有，作为权益与凭证。

目标：提供清晰 UI/UX 信息架构、后端领域模型、API、合约接口、任务调度与风控策略，便于团队分工与快速交付。

---

# 1. 角色与权限（Personas & RBAC）

* **User（用户）**：注册/登录、绑定钱包、购买卡（铸造 NFT）、查看/领取收益、分享邀请。
* **Referrer（分享者）**：拥有邀请链接，按成交金额获得 **1%** USDT 佣金。
* **Agent（代理）**：渠道推广，按成交金额获得 **3%** USDT 佣金；可查看团队统计。
* **Admin（管理员）**：产品配置、费率/收益率、批量发放（或生成 Merkle 空投）、资金划转、风控与审计。

> 权限模型：`user` / `agent` / `admin`（后端基于 JWT + RBAC，前端基于路由守卫与组件级授权）。

---

# 2. UI/UX 信息架构

## 2.1 站点结构（导航）

* **Landing**（营销页）
* **Auth**（邮箱/社交/钱包登录）
* **NFT Catalog**（卡片商店：银/金/钻）
* **Purchase Flow**（下单与链上签名）
* **Dashboard · User**（资产/收益/订单/邀请）
* **Referral**（邀请中心：链接、二维码、统计、提现）
* **Dashboard · Agent**（团队看板：规模、转化、佣金结算）
* **Admin Console**（产品/费率/清结算/合约运维/审计）

## 2.2 关键页面与模块

### Landing

* 价值主张：固定收益+数字凭证（NFT）；
* 卡片对比：起投额、锁定期、年化（APR）、月收益示例；
* 合规与风险提示（显著位置）；
* CTA：**Connect Wallet / Sign Up**、去购买。

### Auth

* 邮箱魔法链接/密码登录 + **Web3 钱包连接（wagmi + RainbowKit/Privy）**；
* 2FA（可选）：TOTP；
* 绑定关系：一个账号可绑定多个 EVM 钱包，设定 **Primary Wallet**。

### NFT Catalog（卡片商店）

* 卡片卡片（Card）组件：名称、起投、锁定期、APR、库存（如设）、权益；
* 交互：选择额度 → 勾选协议 → `Purchase`；
* 成功后：显示 **订单号**、**NFT TokenId**、**链上交易哈希**、预计首个派息时间。

### Purchase Flow（购买）

* Stepper：选择卡 → 填写金额 → 确认订单（价格、费率、推荐/代理归属）→ **链上授权/支付/铸造** → 结果页；
* 失败/异常态：授权失败、Gas 不足、价格波动、额度下限未达等；
* 法律合规勾选：服务协议、风险揭示、KYC（如启用）。

### Dashboard · User

* **资产总览**：总投入、累计收益、待领取收益、在投卡片数；
* **持仓列表**：卡片类型、NFT TokenId、投入金额、起息日、下次派息日、到期日、状态（在投/已到期/赎回中）；
* **收益曲线**：月度收益（可下载 CSV）；
* **订单 & 交易**：法币 ↔ USDT 指引（如需）、链上交易记录；
* **领取收益**：合约 `claim()` 或 Merkle 领取；
* **分享入口**：我的邀请链接、二维码、邀请统计（成交额、佣金、状态）。

### Referral（C2C 1%）

* 我的邀请码/链接；
* 受邀用户列表：实名/钱包、订单、佣金计算基数与比例、发放状态；
* 一键生成素材（社媒标题、海报图、短链）；
* 佣金提现：到 **USDT**（链上/链下）

### Dashboard · Agent（3%）

* 团队规模：注册数、KYC 通过数、首投数；
* 成交与转化：日/周/月；
* 佣金：应发/已发/待发、明细导出；
* 下级明细（仅一层，避免多级传销风险）；
* 渠道追踪：来源参数、短链管理、子推广位。

### Admin Console

* 产品管理：新增/上下架卡片、起投额/上限、锁定期、APR、生效时间；
* 费率/奖励：C2C 1%、Agent 3% 可配置（支持不同活动期）；
* 结算：批量生成 **Payout**、**Commission**、**Merkle Root**；
* 合约运维：金库地址、操作员、多签、阈值、白名单；
* 风控与审计：黑名单、限额、地理与 IP 策略、操作日志、导出报表。

> **UI 组件建议（shadcn/ui）**：Card、Tabs、Dialog、Drawer、DataTable、Badge、Alert、Toast、Skeleton、Progress、Tooltip、Dropdown、Chart（recharts）。

---

# 3. 交互与状态（UX 细节）

* 全局 Loading/Skeleton、错误提示（可重试/联系客服）；
* 金额输入：**最小起投、步进、格式化**（千分位、小数位 6 位）；
* 时区：所有时间以用户本地+UTC 双显示；
* 多语言：**中/英** 国际化（i18next），货币统一 USDT；
* 可访问性：键盘可导航、ARIA 标签、对比度；
* 追踪：埋点（page\_view、purchase\_intent、purchase\_success、claim、withdraw\_commission）。

---

# 4. 技术架构

* 前端：**Next.js（App Router）+ TypeScript + Tailwind + shadcn/ui + wagmi/viem + RainbowKit**；
* 后端：**NestJS/Express + TypeScript**；
* DB：**PostgreSQL + Prisma**；
* 队列/任务：**BullMQ/Redis**（结算、监听链上事件、生成 Merkle、批量通知）；
* 合约：Solidity（EVM 兼容链，建议 **Arbitrum/Polygon**），主要合约见 §7；
* 基础设施：Alchemy/Infura（RPC）、Cloudflare/NGINX、S3/Cloudflare R2（NFT 元数据与图像）。

---

# 5. 数据模型（Prisma 草案）

```prisma
model User {
  id              String   @id @default(cuid())
  email           String?  @unique
  passwordHash    String?
  role            Role     @default(USER)
  referralCode    String   @unique
  referredById    String?  // 上级分享者
  agentId         String?  // 归属代理
  wallets         Wallet[]
  orders          Order[]
  positions       Position[]
  payouts         Payout[]
  commissions     Commission[] @relation("CommissionUser")
  createdAt       DateTime @default(now())
}

enum Role { USER AGENT ADMIN }

model Wallet {
  id          String  @id @default(cuid())
  userId      String
  chainId     Int
  address     String
  isPrimary   Boolean @default(false)
  createdAt   DateTime @default(now())
  @@unique([chainId, address])
}

model Product { // 卡片配置
  id          String  @id @default(cuid())
  symbol      String  // SILVER/GOLD/DIAMOND
  name        String
  minAmount   Decimal  // 起投
  maxAmount   Decimal?
  aprBps      Int      // 年化（基点）
  lockDays    Int
  nftTokenId  Int      // ERC-1155 tokenId
  isActive    Boolean  @default(true)
  startsAt    DateTime
  endsAt      DateTime?
}

model Order {
  id            String   @id @default(cuid())
  userId        String
  productId     String
  usdtAmount    Decimal
  txHash        String?  // 购买链上交易哈希
  status        OrderStatus @default(PENDING)
  referrerId    String?
  agentId       String?
  createdAt     DateTime @default(now())
}

enum OrderStatus { PENDING SUCCESS FAILED CANCELED }

model Position { // 持仓（与 NFT 一一对应）
  id            String  @id @default(cuid())
  userId        String
  productId     String
  orderId       String
  principal     Decimal
  startDate     DateTime
  nextPayoutAt  DateTime
  endDate       DateTime
  nftTokenId    Int
  nftTokenUri   String?
  status        PositionStatus @default(ACTIVE)
}

enum PositionStatus { ACTIVE REDEEMING CLOSED DEFAULTED }

model Payout { // 每月派息记录（用户）
  id          String  @id @default(cuid())
  userId      String
  positionId  String
  amount      Decimal
  periodStart DateTime
  periodEnd   DateTime
  claimable   Boolean @default(false)
  claimedAt   DateTime?
  txHash      String?
}

model Commission { // 分享/代理佣金
  id           String  @id @default(cuid())
  userId       String  // 收款人（分享者或代理）
  orderId      String
  basisAmount  Decimal // 计算基数（成交额）
  rateBps      Int     // 100 = 1%、300 = 3%
  amount       Decimal
  role         CommissionRole // REFERRAL or AGENT
  status       CommissionStatus @default(UNSETTLED)
  settledAt    DateTime?
  txHash       String?
}

enum CommissionRole { REFERRAL AGENT }

enum CommissionStatus { UNSETTLED READY PAID FAILED }

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String
  meta      Json?
  createdAt DateTime @default(now())
}
```

---

# 6. 业务规则与计算

* **固定收益**：`monthly_interest = principal * APR / 12`；APR 用基点：`apr = aprBps / 10000`；
* **派息时间**：下单 T+1 起息；每月同日派发（防止月底缺失，若当月无该日，则顺延至月末）。
* **到期**：`endDate = startDate + lockDays`；到期后停止计息，可赎回本金（链上/离线结算策略见 §8）。
* **佣金**：

  * **C2C**：`1%`（100 Bps），基数为 `Order.usdtAmount`（含/不含手续费需在产品参数确定，建议**不含链上 Gas**且**不含平台手续费**）；
  * **Agent**：`3%`（300 Bps），同上；
  * 佣金同时生效（即：如果订单有 referrer 且归属 agent，则两笔佣金都会生成）。
* **上限**：防止超大单影响风控，可设产品/用户/日上限；
* **多级限制**：仅**一层**推荐与**一层**代理，不叠级；
* **小数精度**：金额统一 `Decimal(78, 18)`；展示时保留 6 位；
* **时区与日历**：统一 UTC 存储、以用户本地显示。

---

# 7. 合约设计（Solidity）

> 先以 **混合方案**上线：订单/佣金/派息主要在**链下账本**计算，链上用于**资产托管、NFT 凭证与领取分发**，降低复杂度与 Gas 成本。

## 7.1 合约清单

1. **Treasury**（资金金库）：

* `depositUSDT(address user, uint256 amount)`：收款（可由前端合约路由/Permit2 简化授权）；
* `withdrawUSDT(address to, uint256 amount)`：运营多签提款（对接量化交易/回填收益）；
* 角色：`OPERATOR`（多签）与 `PAUSER`。

2. **Card1155**（权益 NFT，ERC‑1155）：

* `mint(address to, uint256 tokenId, uint256 amount, bytes data)`：每笔订单 **1 枚**（amount=1）；
* `setURI(tokenId, uri)`：按卡种配置元数据；
* `lockable`（可选扩展）：到期前不可转移/仅白名单可转移。

3. **Distributor**（领取分发）：

* 模式 A：**MerkleDistributor**：后端批量计算应发清单，链上仅校验 Root 并发放；
* 模式 B：**直接转账**：小规模时由运营多签直接发放（便捷但透明度略低）。

> 事件（Events）必须完整，后端 **Watcher** 订阅并落库，确保账实相符。

---

# 8. 关键流程（时序）

## 8.1 购买（含 NFT 铸造）

1. 前端：用户选择卡片与金额 → 生成订单草稿（`/api/orders/draft`）→ 返回费率、佣金归属；
2. 用户签名/授权 USDT（Permit2）→ `Treasury.depositUSDT`；
3. 交易确认后，后端监听链上事件：`Deposited(user, amount, txHash)`；
4. 后端创建 `Order(SUCCESS)`，生成 `Position`，调用 `Card1155.mint(to, tokenId, 1)`；
5. 前端显示结果页：订单号、NFT TokenId、交易哈希、起息/到期日。

## 8.2 月度派息（批处理）

1. CRON 任务扫描到期区间的 `Position`；
2. 计算每个持仓的当期应发 `Payout`，聚合为用户总额；
3. 运营回填收益至 Treasury（或确认金库余额充足）；
4. 生成 **Merkle** 并上链 `root`，前端可视化公示；
5. 用户在前端调用 `claim(index, account, amount, proof)` 领取。

## 8.3 佣金结算（1% / 3%）

1. 订单成功即写入两条 `Commission`（REFERRAL/AGENT）；
2. 设为 `READY` 后进入批量发放流程：

   * 小额频发：合并到 `MerkleDistributor`；
   * 大额单发：多签转账；
3. 发放成功回写 `PAID` 与 `txHash`。

## 8.4 赎回/到期

* 到期后停止计息，`status=REDEEMING`；
* 运营从量化钱包回笼资金 → 金库 → 发放本金；
* NFT 可标记为 `CLOSED`，或烧毁（`burn`）以完成生命周期。

---

# 9. 后端 API（REST 示例）

> 统一前缀 `/api/v1`，全部返回含 `requestId`，幂等写接口需 `Idempotency-Key`。

* `GET /products`：卡片列表
* `POST /orders/draft`：创建订单草稿（校验限额/归属）
* `POST /orders/:id/confirm`：写入链上 txHash → 等待监听
* `GET /positions`：我的持仓
* `GET /payouts?status=claimable`：可领取派息
* `POST /claims/prepare`：返回 Merkle 领取参数
* `POST /referral/link`：生成/刷新邀请链接
* `GET /commissions?role=REFERRAL|AGENT&status=`：佣金明细
* `POST /withdraw/commission`：申请佣金提现（链上/链下）
* `GET /agent/overview`：团队统计
* `POST /admin/products` / `PATCH /admin/products/:id`
* `POST /admin/settlement/payouts`：生成当期派息批次
* `POST /admin/settlement/commissions`：生成佣金批次
* `POST /admin/distributor/merkle`：上链 Merkle Root

---

# 10. 前端实现要点

* **状态管理**：Zustand/Redux Toolkit；
* **数据抓取**：SWR/React Query（含缓存、错误重试、乐观更新）
* **表格**：DataTable + 服务器分页/排序/导出 CSV；
* **表单**：react-hook-form + zod 校验；
* **Web3**：wagmi/viem + Permit2 + 多链 RPC 失效回退；
* **文件与图像**：NFT 元数据（S3/R2），URI 使用 `ipfs://` 或 https 网关；
* **可视化**：recharts 单图/无特定配色；
* **多租户（可选）**：以 `Tenant` 维度隔离代理品牌（域名/皮肤/费率），数据库加 `tenantId` 字段。

---

# 11. 风控与合规（关键策略）

* 额度限制：单笔/单日/单用户上限，动态风控；
* 风险画像：新用户冷却期、异常大单审批、IP/地理限制；
* 黑白名单：钱包/地址/国家；
* 审计追踪：`AuditLog` 全量记录，操作回放；
* 资金透明：金库余额看板、发放批次公示、可验证 Merkle；
* 关键操作多签（金库提款、Root 提交、参数变更）；
* 法务：服务协议、隐私政策、风险披露、KYC（如监管要求）。

---

# 12. 监控与运维

* 指标：购买转化率、留存、ARPU、资金入金/出金、未结收益、佣金应发、金库余额；
* 技术监控：API P95、队列滞留、任务失败率、区块延迟；
* 日志：结构化 JSON + requestId；
* 告警：Slack/飞书 + PagerDuty；
* 备份：Pos
