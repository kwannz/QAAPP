import { DatabaseService } from '../../database/database.service';
import { QueryOptimizerService } from '../../database/query-optimizer.service';
import { MultiLayerCacheService } from '../../cache/multi-layer-cache.service';
import { CreateOrderDto, ConfirmOrderDto } from '../dto/orders.dto';
export declare class OrderProcessingService {
    private readonly database;
    private readonly queryOptimizer;
    private readonly cache;
    private readonly logger;
    constructor(database: DatabaseService, queryOptimizer: QueryOptimizerService, cache: MultiLayerCacheService);
    processOrderCreation(createOrderDto: CreateOrderDto, userId: string): Promise<any>;
    processOrderConfirmation(orderId: string, confirmDto: ConfirmOrderDto, userId: string): Promise<any>;
    processOrderCancellation(orderId: string, userId: string, reason?: string): Promise<any>;
    private getUserWithCache;
    private getProductWithCache;
    private getReferrerByCode;
    private calculatePlatformFee;
    private validateProductAvailability;
    private validateTransaction;
    private invalidateUserCache;
    private invalidateOrderCache;
}
