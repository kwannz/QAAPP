import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, OrderQueryDto, ConfirmOrderDto, OrderResponseDto, OrderListResponseDto, OrderStatsResponseDto, BatchUpdateOrdersDto } from '../dto/orders.dto';
import { AuthenticatedRequest } from '../../common/types/express.types';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getMyOrders(req: AuthenticatedRequest, queryDto: OrderQueryDto): Promise<OrderListResponseDto>;
    findOne(id: string, req: AuthenticatedRequest): Promise<OrderResponseDto>;
    create(createOrderDto: CreateOrderDto, req: AuthenticatedRequest): Promise<OrderResponseDto>;
    createWithETH(createOrderDto: CreateOrderDto, req: AuthenticatedRequest): Promise<OrderResponseDto>;
    confirmOrder(id: string, confirmDto: ConfirmOrderDto, req: AuthenticatedRequest): Promise<OrderResponseDto>;
    cancelOrder(id: string, req: AuthenticatedRequest): Promise<OrderResponseDto>;
    getAdminOrderList(status?: string, riskLevel?: string, dateRange?: string, search?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<OrderListResponseDto>;
    getOrderStats(): Promise<OrderStatsResponseDto>;
    approveOrder(id: string, approvalData?: {
        notes?: string;
    }): Promise<OrderResponseDto>;
    rejectOrder(id: string, rejectionData: {
        reason: string;
        notes?: string;
    }): Promise<OrderResponseDto>;
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
    exportOrders(status?: string, dateRange?: string, format?: string): Promise<{
        format: string;
        data: OrderResponseDto[];
    }>;
    getOrderAuditTrail(id: string): Promise<{
        orderId: string;
        auditTrail: any[];
    }>;
}
