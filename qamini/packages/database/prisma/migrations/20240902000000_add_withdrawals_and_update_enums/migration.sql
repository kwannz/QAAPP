-- CreateEnum for new withdrawal types
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');
CREATE TYPE "WithdrawalType" AS ENUM ('EARNINGS', 'PRINCIPAL', 'COMMISSION');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable for withdrawals
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "withdrawal_type" "WithdrawalType" NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "wallet_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "platform_fee" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "actual_amount" DECIMAL(20,6) NOT NULL,
    "tx_hash" TEXT,
    "block_number" INTEGER,
    "gas_used" INTEGER,
    "gas_fee" DECIMAL(20,6),
    "risk_score" INTEGER NOT NULL DEFAULT 0,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "risk_factors" JSONB,
    "auto_approved" BOOLEAN NOT NULL DEFAULT false,
    "reviewer_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "rejection_reason" TEXT,
    "processed_at" TIMESTAMP(3),
    "processed_by" TEXT,
    "batch_id" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "kyc_verified" BOOLEAN NOT NULL DEFAULT false,
    "aml_check_passed" BOOLEAN NOT NULL DEFAULT false,
    "compliance_notes" TEXT,
    "metadata" JSONB,
    "internal_notes" TEXT,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "withdrawals_user_id_status_idx" ON "withdrawals"("user_id", "status");
CREATE INDEX "withdrawals_status_risk_level_idx" ON "withdrawals"("status", "risk_level");
CREATE INDEX "withdrawals_requested_at_idx" ON "withdrawals"("requested_at");
CREATE INDEX "withdrawals_reviewer_id_idx" ON "withdrawals"("reviewer_id");
CREATE INDEX "withdrawals_batch_id_idx" ON "withdrawals"("batch_id");
CREATE INDEX "withdrawals_wallet_address_idx" ON "withdrawals"("wallet_address");
CREATE INDEX "withdrawals_tx_hash_idx" ON "withdrawals"("tx_hash");

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;