import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Auth } from '../../auth/decorators/auth.decorator';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductQueryDto,
  ProductResponseDto,
  ProductListResponseDto
} from '../dto/products.dto';
import { AuthenticatedRequest } from '../../common/types/express.types';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ 
    summary: 'Get all products with filtering and pagination',
    description: 'Retrieve a paginated list of products with optional filtering by symbol, status, and other criteria.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Products retrieved successfully',
    type: ProductListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid query parameters'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'symbol', required: false, type: String, description: 'Filter by symbol' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive products' })
  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) queryDto: ProductQueryDto
  ): Promise<ProductListResponseDto> {
    return this.productsService.findAll(queryDto);
  }

  @ApiOperation({ 
    summary: 'Get product by ID',
    description: 'Retrieve detailed information about a specific product by its ID.'
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product found successfully',
    type: ProductResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid product ID format'
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ 
    summary: 'Create new product',
    description: 'Create a new financial product. Requires admin privileges.'
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Product created successfully',
    type: ProductResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid product data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Product with this symbol already exists'
  })
  @Auth('ADMIN')
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Update product',
    description: 'Update an existing product. Requires admin privileges.'
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Product updated successfully',
    type: ProductResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid product data or ID format'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found'
  })
  @Auth('ADMIN')
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Delete product',
    description: 'Soft delete a product (mark as inactive). Requires admin privileges.'
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product deleted successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid product ID format'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found'
  })
  @Auth('ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<{ message: string; productId: string }> {
    return this.productsService.remove(id, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Get product availability',
    description: 'Check if a product is available for purchase with specified amount.'
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Investment amount to check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Availability check completed',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        reason: { type: 'string' },
        maxAmount: { type: 'number' },
        remainingCapacity: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid parameters'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found'
  })
  @Get(':id/availability')
  async checkAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('amount') amount: number
  ) {
    return this.productsService.checkAvailability(id, amount);
  }

  @ApiOperation({ 
    summary: 'Get product statistics',
    description: 'Retrieve statistical information about a product including performance metrics.'
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalInvestments: { type: 'number' },
        totalInvestors: { type: 'number' },
        averageInvestment: { type: 'number' },
        currentYield: { type: 'number' },
        performanceHistory: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              yield: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/statistics')
  async getStatistics(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.productsService.getStatistics(id);
  }
}
