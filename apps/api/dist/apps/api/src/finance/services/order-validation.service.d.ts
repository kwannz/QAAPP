import { DatabaseService } from '../../database/database.service';
import { MultiLayerCacheService } from '../../cache/multi-layer-cache.service';
import { CreateOrderDto } from '../dto/orders.dto';
interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metadata?: Record<string, any>;
}
export declare class OrderValidationService {
    private readonly database;
    private readonly cache;
    private readonly logger;
    constructor(database: DatabaseService, cache: MultiLayerCacheService);
    validateOrderCreation(createOrderDto: CreateOrderDto, userId: string): Promise<ValidationResult>;
    private validateUser;
    private validateProduct;
    private validateAmount;
    private validateUserLimits;
    private validateReferrer;
    private validateRiskFactors;
    private invalidateUserCache;
    private invalidateOrderCache;
}
export {};
