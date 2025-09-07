import { DatabaseService } from '../../database/database.service';
import { ProductsService } from './products.service';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PositionsService } from './positions.service';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto, ConfirmOrderDto, OrderResponseDto, OrderListResponseDto, OrderStatsResponseDto, BatchUpdateOrdersDto } from '../dto/orders.dto';
export declare class OrdersService {
    private database;
    private productsService;
    private blockchainService;
    private positionsService;
    private readonly logger;
    constructor(database: DatabaseService, productsService: ProductsService, blockchainService: BlockchainService, positionsService: PositionsService);
    createDraft(createOrderDto: CreateOrderDto, userId: string): Promise<OrderResponseDto>;
    findUserOrders(userId: string, queryDto?: OrderQueryDto): Promise<OrderListResponseDto>;
    findAll(queryDto?: OrderQueryDto): Promise<OrderListResponseDto>;
    create(createOrderDto: CreateOrderDto, userId?: string): Promise<OrderResponseDto>;
    update(orderId: string, updateOrderDto: UpdateOrderDto, userId?: string): Promise<OrderResponseDto>;
    findAllOrders(queryDto?: OrderQueryDto): Promise<{
        orders: OrderResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }>;
    findOne(orderId: string, userId?: string): Promise<OrderResponseDto>;
    cancelOrder(orderId: string, userId: string): Promise<OrderResponseDto>;
    private createPosition;
    private createCommissions;
    private formatOrderResponse;
    private createAuditLog;
    getAdminOrderList(filters: any): Promise<OrderListResponseDto>;
    getOrderStats(): Promise<OrderStatsResponseDto>;
    approveOrder(id: string, approvalData: any): Promise<OrderResponseDto>;
    rejectOrder(id: string, rejectionData: any): Promise<OrderResponseDto>;
    batchUpdateOrders(batchData: BatchUpdateOrdersDto): Promise<{
        updated: number;
        results: OrderResponseDto[];
    }>;
    getOrderRiskAnalysis(id: string): Promise<{
        orderId: string;
        riskScore: number;
        riskLevel: string;
        factors: string[];
    }>;
    reEvaluateOrderRisk(id: string): Promise<{
        orderId: string;
        riskScore: number;
        riskLevel: string;
        factors: string[];
    }>;
    exportOrders(filters: any): Promise<{
        format: string;
        data: OrderResponseDto[];
    }>;
    getOrderAuditTrail(id: string): Promise<{
        orderId: string;
        auditTrail: any[];
    }>;
    confirmOrder(orderId: string, confirmDto: ConfirmOrderDto, userId: string): Promise<OrderResponseDto>;
}
