import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ProductResponseDto, ProductListResponseDto } from '../dto/products.dto';
import { AuthenticatedRequest } from '../../common/types/express.types';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(queryDto: ProductQueryDto): Promise<ProductListResponseDto>;
    findOne(id: string): Promise<ProductResponseDto>;
    create(createProductDto: CreateProductDto, req: AuthenticatedRequest): Promise<ProductResponseDto>;
    update(id: string, updateProductDto: UpdateProductDto, req: AuthenticatedRequest): Promise<ProductResponseDto>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
        productId: string;
    }>;
    checkAvailability(id: string, amount: number): Promise<{
        available: boolean;
        reason?: string;
        maxAmount?: number;
        remainingCapacity?: number;
    }>;
    getStatistics(id: string): Promise<any>;
}
