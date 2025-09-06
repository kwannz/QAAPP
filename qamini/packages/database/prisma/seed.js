"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('开始种子数据初始化...');
    // 清理现有数据
    await prisma.auditLogs.deleteMany();
    await prisma.commissions.deleteMany();
    await prisma.payouts.deleteMany();
    await prisma.positions.deleteMany();
    await prisma.orders.deleteMany();
    await prisma.wallets.deleteMany();
    await prisma.products.deleteMany();
    await prisma.users.deleteMany();
    await prisma.systemConfigs.deleteMany();
    await prisma.batchJobs.deleteMany();
    console.log('✅ 清理完成');
    // 1. 创建系统配置
    const systemConfigs = await Promise.all([
        prisma.systemConfigs.create({
            data: {
                key: 'platform_fee_rate',
                value: { rate: 0.005, description: '平台手续费率' }, // 0.5%
                category: 'fee',
                isActive: true,
            },
        }),
        prisma.systemConfigs.create({
            data: {
                key: 'referral_commission_rate',
                value: { rate: 0.01, description: 'C2C推荐佣金率' }, // 1%
                category: 'commission',
                isActive: true,
            },
        }),
        prisma.systemConfigs.create({
            data: {
                key: 'agent_commission_rate',
                value: { rate: 0.03, description: '代理商佣金率' }, // 3%
                category: 'commission',
                isActive: true,
            },
        }),
        prisma.systemConfigs.create({
            data: {
                key: 'min_investment_amount',
                value: { amount: 100, currency: 'USDT', description: '最小投资金额' },
                category: 'investment',
                isActive: true,
            },
        }),
        prisma.systemConfigs.create({
            data: {
                key: 'max_investment_amount',
                value: { amount: 100000, currency: 'USDT', description: '最大投资金额' },
                category: 'investment',
                isActive: true,
            },
        }),
    ]);
    console.log('✅ 系统配置创建完成');
    // 2. 创建管理员用户
    const adminUser = await prisma.users.create({
        data: {
            id: 'admin-001',
            email: 'admin@qa-app.com',
            passwordHash: await (0, bcryptjs_1.hash)('Admin123!', 12),
            role: client_1.UserRole.ADMIN,
            referralCode: 'ADMIN001',
            kycStatus: client_1.KycStatus.APPROVED,
            isActive: true,
            lastLoginAt: new Date(),
        },
    });
    // 3. 创建代理商用户
    const agentUsers = await Promise.all([
        prisma.users.create({
            data: {
                id: 'agent-001',
                email: 'agent1@qa-app.com',
                passwordHash: await (0, bcryptjs_1.hash)('Agent123!', 12),
                role: client_1.UserRole.AGENT,
                referralCode: 'AGENT001',
                kycStatus: client_1.KycStatus.APPROVED,
                isActive: true,
            },
        }),
        prisma.users.create({
            data: {
                id: 'agent-002',
                email: 'agent2@qa-app.com',
                passwordHash: await (0, bcryptjs_1.hash)('Agent123!', 12),
                role: client_1.UserRole.AGENT,
                referralCode: 'AGENT002',
                kycStatus: client_1.KycStatus.APPROVED,
                isActive: true,
            },
        }),
    ]);
    // 4. 创建普通用户
    const regularUsers = await Promise.all([
        prisma.users.create({
            data: {
                id: 'user-001',
                email: 'user1@example.com',
                passwordHash: await (0, bcryptjs_1.hash)('User123!', 12),
                role: client_1.UserRole.USER,
                referralCode: 'USER001',
                referredById: agentUsers[0].id,
                agentId: agentUsers[0].id,
                kycStatus: client_1.KycStatus.APPROVED,
                isActive: true,
            },
        }),
        prisma.users.create({
            data: {
                id: 'user-002',
                email: 'user2@example.com',
                passwordHash: await (0, bcryptjs_1.hash)('User123!', 12),
                role: client_1.UserRole.USER,
                referralCode: 'USER002',
                referredById: 'user-001',
                agentId: agentUsers[0].id,
                kycStatus: client_1.KycStatus.PENDING,
                isActive: true,
            },
        }),
        prisma.users.create({
            data: {
                id: 'user-003',
                email: 'user3@example.com',
                passwordHash: await (0, bcryptjs_1.hash)('User123!', 12),
                role: client_1.UserRole.USER,
                referralCode: 'USER003',
                agentId: agentUsers[1].id,
                kycStatus: client_1.KycStatus.APPROVED,
                isActive: true,
            },
        }),
    ]);
    console.log('✅ 用户创建完成');
    // 5. 创建钱包地址
    const wallets = await Promise.all([
        // 管理员钱包
        prisma.wallets.create({
            data: {
                userId: adminUser.id,
                chainId: 1,
                address: '0x1234567890123456789012345678901234567890',
                isPrimary: true,
                label: '管理员主钱包',
            },
        }),
        // 代理商钱包
        ...agentUsers.map((agent, index) => prisma.wallets.create({
            data: {
                userId: agent.id,
                chainId: 1,
                address: `0x${(index + 1).toString().padStart(40, '0')}`,
                isPrimary: true,
                label: `代理商钱包${index + 1}`,
            },
        })),
        // 用户钱包
        ...regularUsers.map((user, index) => prisma.wallets.create({
            data: {
                userId: user.id,
                chainId: 1,
                address: `0x${(index + 10).toString().padStart(40, '0')}`,
                isPrimary: true,
                label: `用户钱包${index + 1}`,
            },
        })),
    ]);
    console.log('✅ 钱包创建完成');
    // 6. 创建产品
    const products = await Promise.all([
        prisma.products.create({
            data: {
                symbol: 'QASILVER',
                name: 'QA白银卡',
                description: '30天期固定收益产品，年化收益率12%',
                minAmount: 100,
                maxAmount: 10000,
                aprBps: 1200, // 12% APR in basis points
                lockDays: 30,
                nftTokenId: 1,
                nftMetadata: {
                    name: 'QA白银卡',
                    image: 'https://assets.qa-app.com/nft/silver.png',
                    attributes: [
                        { trait_type: 'Type', value: 'Silver' },
                        { trait_type: 'Lock Period', value: '30 days' },
                        { trait_type: 'APR', value: '12%' },
                    ],
                },
                totalSupply: 10000,
                currentSupply: 0,
                isActive: true,
                startsAt: new Date(),
                endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后结束
            },
        }),
        prisma.products.create({
            data: {
                symbol: 'QAGOLD',
                name: 'QA黄金卡',
                description: '60天期固定收益产品，年化收益率15%',
                minAmount: 1000,
                maxAmount: 50000,
                aprBps: 1500, // 15% APR
                lockDays: 60,
                nftTokenId: 2,
                nftMetadata: {
                    name: 'QA黄金卡',
                    image: 'https://assets.qa-app.com/nft/gold.png',
                    attributes: [
                        { trait_type: 'Type', value: 'Gold' },
                        { trait_type: 'Lock Period', value: '60 days' },
                        { trait_type: 'APR', value: '15%' },
                    ],
                },
                totalSupply: 5000,
                currentSupply: 0,
                isActive: true,
                startsAt: new Date(),
                endsAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120天后结束
            },
        }),
        prisma.products.create({
            data: {
                symbol: 'QADIAMOND',
                name: 'QA钻石卡',
                description: '90天期固定收益产品，年化收益率18%',
                minAmount: 5000,
                maxAmount: 200000,
                aprBps: 1800, // 18% APR
                lockDays: 90,
                nftTokenId: 3,
                nftMetadata: {
                    name: 'QA钻石卡',
                    image: 'https://assets.qa-app.com/nft/diamond.png',
                    attributes: [
                        { trait_type: 'Type', value: 'Diamond' },
                        { trait_type: 'Lock Period', value: '90 days' },
                        { trait_type: 'APR', value: '18%' },
                    ],
                },
                totalSupply: 1000,
                currentSupply: 0,
                isActive: true,
                startsAt: new Date(),
                endsAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180天后结束
            },
        }),
    ]);
    console.log('✅ 产品创建完成');
    // 7. 创建示例订单和仓位
    const orders = await Promise.all([
        // user-001的白银卡订单
        prisma.orders.create({
            data: {
                userId: regularUsers[0].id,
                productId: products[0].id,
                usdtAmount: 1000,
                platformFee: 5,
                txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                status: client_1.OrderStatus.SUCCESS,
                referrerId: agentUsers[0].id,
                agentId: agentUsers[0].id,
                confirmedAt: new Date(),
                metadata: {
                    paymentMethod: 'wallet',
                    confirmations: 12,
                },
            },
        }),
        // user-002的黄金卡订单
        prisma.orders.create({
            data: {
                userId: regularUsers[1].id,
                productId: products[1].id,
                usdtAmount: 5000,
                platformFee: 25,
                txHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
                status: client_1.OrderStatus.SUCCESS,
                referrerId: regularUsers[0].id,
                agentId: agentUsers[0].id,
                confirmedAt: new Date(),
            },
        }),
        // user-003的钻石卡订单
        prisma.orders.create({
            data: {
                userId: regularUsers[2].id,
                productId: products[2].id,
                usdtAmount: 10000,
                platformFee: 50,
                txHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                status: client_1.OrderStatus.SUCCESS,
                agentId: agentUsers[1].id,
                confirmedAt: new Date(),
            },
        }),
    ]);
    console.log('✅ 订单创建完成');
    // 8. 创建对应的仓位
    const positions = await Promise.all([
        prisma.positions.create({
            data: {
                userId: orders[0].userId,
                productId: orders[0].productId,
                orderId: orders[0].id,
                principal: orders[0].usdtAmount,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                nextPayoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天第一次分红
                nftTokenId: 1,
                nftTokenUri: 'https://assets.qa-app.com/nft/silver-metadata.json',
                status: client_1.PositionStatus.ACTIVE,
            },
        }),
        prisma.positions.create({
            data: {
                userId: orders[1].userId,
                productId: orders[1].productId,
                orderId: orders[1].id,
                principal: orders[1].usdtAmount,
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                nextPayoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                nftTokenId: 2,
                nftTokenUri: 'https://assets.qa-app.com/nft/gold-metadata.json',
                status: client_1.PositionStatus.ACTIVE,
            },
        }),
        prisma.positions.create({
            data: {
                userId: orders[2].userId,
                productId: orders[2].productId,
                orderId: orders[2].id,
                principal: orders[2].usdtAmount,
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                nextPayoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                nftTokenId: 3,
                nftTokenUri: 'https://assets.qa-app.com/nft/diamond-metadata.json',
                status: client_1.PositionStatus.ACTIVE,
            },
        }),
    ]);
    console.log('✅ 仓位创建完成');
    // 9. 创建佣金记录
    const commissions = await Promise.all([
        // agent-001从user-001订单获得的代理佣金
        prisma.commissions.create({
            data: {
                userId: agentUsers[0].id,
                orderId: orders[0].id,
                basisAmount: orders[0].usdtAmount,
                rateBps: 300, // 3%
                amount: orders[0].usdtAmount.toNumber() * 0.03,
                commissionType: client_1.CommissionType.AGENT,
                status: client_1.CommissionStatus.READY,
            },
        }),
        // user-001从user-002订单获得的推荐佣金
        prisma.commissions.create({
            data: {
                userId: regularUsers[0].id,
                orderId: orders[1].id,
                basisAmount: orders[1].usdtAmount,
                rateBps: 100, // 1%
                amount: orders[1].usdtAmount.toNumber() * 0.01,
                commissionType: client_1.CommissionType.REFERRAL,
                status: client_1.CommissionStatus.READY,
            },
        }),
        // agent-001从user-002订单获得的代理佣金
        prisma.commissions.create({
            data: {
                userId: agentUsers[0].id,
                orderId: orders[1].id,
                basisAmount: orders[1].usdtAmount,
                rateBps: 300, // 3%
                amount: orders[1].usdtAmount.toNumber() * 0.03,
                commissionType: client_1.CommissionType.AGENT,
                status: client_1.CommissionStatus.READY,
            },
        }),
        // agent-002从user-003订单获得的代理佣金
        prisma.commissions.create({
            data: {
                userId: agentUsers[1].id,
                orderId: orders[2].id,
                basisAmount: orders[2].usdtAmount,
                rateBps: 300, // 3%
                amount: orders[2].usdtAmount.toNumber() * 0.03,
                commissionType: client_1.CommissionType.AGENT,
                status: client_1.CommissionStatus.PAID,
                settledAt: new Date(),
                settlementTxHash: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
            },
        }),
    ]);
    console.log('✅ 佣金记录创建完成');
    // 10. 创建分红记录
    const payouts = await Promise.all([
        // 为每个活跃仓位创建未来7天的分红记录
        ...positions.map((position, positionIndex) => {
            const dailyPayout = position.principal.toNumber() * (products[positionIndex].aprBps / 10000) / 365;
            return Promise.all(Array.from({ length: 7 }, (_, dayIndex) => {
                const payoutDate = new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000);
                return prisma.payouts.create({
                    data: {
                        userId: position.userId,
                        positionId: position.id,
                        amount: dailyPayout,
                        periodStart: payoutDate,
                        periodEnd: new Date(payoutDate.getTime() + 24 * 60 * 60 * 1000),
                        isClaimable: dayIndex === 0, // 只有第一天的分红可以立即领取
                    },
                });
            }));
        }),
    ]);
    console.log('✅ 分红记录创建完成');
    // 11. 创建审计日志
    await Promise.all([
        prisma.auditLogs.create({
            data: {
                actorId: adminUser.id,
                actorType: 'ADMIN',
                action: 'SYSTEM_INIT',
                resourceType: 'SYSTEM',
                metadata: {
                    description: '系统初始化完成',
                    timestamp: new Date().toISOString(),
                },
            },
        }),
        ...orders.map(order => prisma.auditLogs.create({
            data: {
                actorId: order.userId,
                actorType: 'USER',
                action: 'ORDER_CREATE',
                resourceType: 'ORDER',
                resourceId: order.id,
                metadata: {
                    productId: order.productId,
                    amount: order.usdtAmount.toNumber(),
                    txHash: order.txHash,
                },
            },
        })),
    ]);
    console.log('✅ 审计日志创建完成');
    // 输出统计信息
    const stats = {
        users: await prisma.users.count(),
        wallets: await prisma.wallets.count(),
        products: await prisma.products.count(),
        orders: await prisma.orders.count(),
        positions: await prisma.positions.count(),
        payouts: await prisma.payouts.count(),
        commissions: await prisma.commissions.count(),
        auditLogs: await prisma.auditLogs.count(),
        systemConfigs: await prisma.systemConfigs.count(),
    };
    console.log('\n🎉 种子数据初始化完成！');
    console.log('📊 数据统计：');
    Object.entries(stats).forEach(([key, count]) => {
        console.log(`  ${key}: ${count} 条记录`);
    });
    console.log('\n💡 测试账户信息：');
    console.log('管理员: admin@qa-app.com / Admin123!');
    console.log('代理商1: agent1@qa-app.com / Agent123!');
    console.log('代理商2: agent2@qa-app.com / Agent123!');
    console.log('用户1: user1@example.com / User123!');
    console.log('用户2: user2@example.com / User123!');
    console.log('用户3: user3@example.com / User123!');
}
main()
    .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map