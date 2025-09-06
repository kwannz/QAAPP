-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('ACTIVE', 'REDEEMING', 'CLOSED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('REFERRAL', 'AGENT');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'READY', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "referral_code" TEXT NOT NULL,
    "referred_by_id" TEXT,
    "agent_id" TEXT,
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "kyc_data" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(20,6) NOT NULL,
    "max_amount" DECIMAL(20,6),
    "apr_bps" INTEGER NOT NULL,
    "lock_days" INTEGER NOT NULL,
    "nft_token_id" INTEGER,
    "nft_metadata" JSONB,
    "total_supply" INTEGER,
    "current_supply" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "usdt_amount" DECIMAL(20,6) NOT NULL,
    "platform_fee" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "tx_hash" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "referrer_id" TEXT,
    "agent_id" TEXT,
    "failure_reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "principal" DECIMAL(20,6) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "next_payout_at" TIMESTAMP(3),
    "nft_token_id" INTEGER,
    "nft_token_uri" TEXT,
    "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "is_claimable" BOOLEAN NOT NULL DEFAULT false,
    "claimed_at" TIMESTAMP(3),
    "claim_tx_hash" TEXT,
    "merkle_index" INTEGER,
    "merkle_proof" JSONB,
    "batch_id" TEXT,
    "distribution_tx" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "basis_amount" DECIMAL(20,6) NOT NULL,
    "rate_bps" INTEGER NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "commission_type" "CommissionType" NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "settled_at" TIMESTAMP(3),
    "settlement_tx_hash" TEXT,
    "batch_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_type" TEXT NOT NULL DEFAULT 'USER',
    "action" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "parameters" JSONB,
    "result" JSONB,
    "error_msg" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_referral_code_idx" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_referred_by_id_idx" ON "users"("referred_by_id");

-- CreateIndex
CREATE INDEX "users_agent_id_idx" ON "users"("agent_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_chain_id_address_key" ON "wallets"("chain_id", "address");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "products_symbol_key" ON "products"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "products_nft_token_id_key" ON "products"("nft_token_id");

-- CreateIndex
CREATE INDEX "products_symbol_idx" ON "products"("symbol");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "products_starts_at_idx" ON "products"("starts_at");

-- CreateIndex
CREATE INDEX "products_ends_at_idx" ON "products"("ends_at");

-- CreateIndex
CREATE INDEX "orders_user_id_status_idx" ON "orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "orders_product_id_idx" ON "orders"("product_id");

-- CreateIndex
CREATE INDEX "orders_tx_hash_idx" ON "orders"("tx_hash");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "positions_user_id_status_idx" ON "positions"("user_id", "status");

-- CreateIndex
CREATE INDEX "positions_product_id_idx" ON "positions"("product_id");

-- CreateIndex
CREATE INDEX "positions_order_id_idx" ON "positions"("order_id");

-- CreateIndex
CREATE INDEX "positions_next_payout_at_idx" ON "positions"("next_payout_at");

-- CreateIndex
CREATE INDEX "positions_end_date_idx" ON "positions"("end_date");

-- CreateIndex
CREATE INDEX "positions_status_idx" ON "positions"("status");

-- CreateIndex
CREATE INDEX "payouts_user_id_is_claimable_idx" ON "payouts"("user_id", "is_claimable");

-- CreateIndex
CREATE INDEX "payouts_position_id_idx" ON "payouts"("position_id");

-- CreateIndex
CREATE INDEX "payouts_batch_id_idx" ON "payouts"("batch_id");

-- CreateIndex
CREATE INDEX "payouts_period_start_idx" ON "payouts"("period_start");

-- CreateIndex
CREATE INDEX "payouts_is_claimable_idx" ON "payouts"("is_claimable");

-- CreateIndex
CREATE INDEX "commissions_user_id_commission_type_idx" ON "commissions"("user_id", "commission_type");

-- CreateIndex
CREATE INDEX "commissions_order_id_idx" ON "commissions"("order_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_batch_id_idx" ON "commissions"("batch_id");

-- CreateIndex
CREATE INDEX "commissions_created_at_idx" ON "commissions"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_category_idx" ON "system_configs"("category");

-- CreateIndex
CREATE INDEX "batch_jobs_type_status_idx" ON "batch_jobs"("type", "status");

-- CreateIndex
CREATE INDEX "batch_jobs_created_at_idx" ON "batch_jobs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;