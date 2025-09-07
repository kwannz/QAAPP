import { DatabaseService } from '../../database/database.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ProductListResponseDto, ProductResponseDto } from '../dto/products.dto';
export declare class ProductsService {
    private database;
    private readonly logger;
    constructor(database: DatabaseService);
    findAll(queryDto?: ProductQueryDto): Promise<ProductListResponseDto>;
    findAllFromDatabase(queryDto?: ProductQueryDto): Promise<any>;
    findOne(id: string): Promise<ProductResponseDto>;
    findOneFromDatabase(id: string): Promise<any>;
    findBySymbol(symbol: string): Promise<any>;
    create(createProductDto: CreateProductDto, adminId: string): Promise<ProductResponseDto>;
    createInDatabase(createProductDto: CreateProductDto, adminId: string): Promise<any>;
    update(id: string, updateProductDto: UpdateProductDto, adminId: string): Promise<ProductResponseDto>;
    updateInDatabase(id: string, updateProductDto: UpdateProductDto, adminId: string): Promise<any>;
    remove(id: string, adminId: string): Promise<{
        message: string;
        productId: string;
    }>;
    removeFromDatabase(id: string, adminId: string): Promise<{
        id: string;
        symbol: string;
        deleted: boolean;
        deletedAt: Date;
    }>;
    getStatistics(id: string): Promise<any>;
    checkAvailability(productId: string, amount: number): Promise<{
        available: boolean;
        reason?: string;
        maxAmount?: number;
        remainingCapacity?: number;
    }>;
    checkAvailabilityFromDatabase(productId: string, amount: number): Promise<{
        available: boolean;
        reason?: string;
    }>;
    private createAuditLog;
}
