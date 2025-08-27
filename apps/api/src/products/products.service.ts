import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/products.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private database: DatabaseService) {}

  /**
   * 获取所有活跃产品
   */
  async findAll(queryDto: ProductQueryDto = {}) {
    const { 
      page = 1, 
      limit = 20, 
      symbol, 
      isActive, 
      includeInactive = false 
    } = queryDto;
    
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    
    if (symbol) {
      where.symbol = { contains: symbol, mode: 'insensitive' };
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    } else if (!includeInactive) {
      where.isActive = true;
    }

    // 只显示未过期的产品
    where.OR = [
      { endsAt: null },
      { endsAt: { gt: new Date() } }
    ];

    const [products, total] = await Promise.all([
      this.database.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          orders: {
            where: { status: 'SUCCESS' },
            select: { id: true, usdtAmount: true },
          },
          positions: {
            where: { status: 'ACTIVE' },
            select: { id: true, principal: true },
          },
          _count: {
            select: {
              orders: {
                where: { status: 'SUCCESS' }
              },
              positions: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
      }),
      this.database.product.count({ where }),
    ]);

    // 计算产品统计信息
    const productsWithStats = products.map(product => {
      const totalSales = product.orders.reduce((sum, order) => {
        return sum + order.usdtAmount.toNumber();
      }, 0);

      const totalInvestments = product.positions.reduce((sum, position) => {
        return sum + position.principal.toNumber();
      }, 0);

      const soldCount = product._count.orders;
      const activePositions = product._count.positions;

      // 计算剩余供应量
      let availableSupply = null;
      if (product.totalSupply) {
        availableSupply = product.totalSupply - product.currentSupply;
      }

      return {
        id: product.id,
        symbol: product.symbol,
        name: product.name,
        description: product.description,
        minAmount: product.minAmount.toNumber(),
        maxAmount: product.maxAmount?.toNumber(),
        apr: product.aprBps / 100, // 转换为百分比
        lockDays: product.lockDays,
        nftTokenId: product.nftTokenId,
        nftMetadata: product.nftMetadata,
        totalSupply: product.totalSupply,
        currentSupply: product.currentSupply,
        availableSupply,
        isActive: product.isActive,
        startsAt: product.startsAt,
        endsAt: product.endsAt,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // 统计信息
        stats: {
          totalSales,
          totalInvestments,
          soldCount,
          activePositions,
        }
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      products: productsWithStats,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * 根据ID获取产品详情
   */
  async findOne(id: string) {
    const product = await this.database.product.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: 'SUCCESS' },
          select: { 
            id: true, 
            usdtAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // 最近10笔订单
        },
        positions: {
          where: { status: 'ACTIVE' },
          select: { 
            id: true, 
            principal: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: {
            orders: {
              where: { status: 'SUCCESS' }
            },
            positions: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 计算详细统计信息
    const totalSales = product.orders.reduce((sum, order) => {
      return sum + order.usdtAmount.toNumber();
    }, 0);

    const totalInvestments = product.positions.reduce((sum, position) => {
      return sum + position.principal.toNumber();
    }, 0);

    const availableSupply = product.totalSupply 
      ? product.totalSupply - product.currentSupply 
      : null;

    // 计算预期年化收益
    const expectedAnnualReturn = (product.aprBps / 10000) * 100;

    return {
      ...product,
      minAmount: product.minAmount.toNumber(),
      maxAmount: product.maxAmount?.toNumber(),
      apr: product.aprBps / 100,
      availableSupply,
      expectedAnnualReturn,
      stats: {
        totalSales,
        totalInvestments,
        soldCount: product._count.orders,
        activePositions: product._count.positions,
        recentOrders: product.orders.map(order => ({
          id: order.id,
          amount: order.usdtAmount.toNumber(),
          createdAt: order.createdAt,
        })),
      }
    };
  }

  /**
   * 根据符号查找产品
   */
  async findBySymbol(symbol: string) {
    const product = await this.database.product.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      minAmount: product.minAmount.toNumber(),
      maxAmount: product.maxAmount?.toNumber(),
      apr: product.aprBps / 100,
    };
  }

  /**
   * 创建新产品（管理员功能）
   */
  async create(createProductDto: CreateProductDto, adminId: string) {
    // 检查产品符号是否已存在
    const existingProduct = await this.database.product.findUnique({
      where: { symbol: createProductDto.symbol.toUpperCase() },
    });

    if (existingProduct) {
      throw new BadRequestException('Product symbol already exists');
    }

    // 验证NFT Token ID是否已被使用
    if (createProductDto.nftTokenId) {
      const existingNftProduct = await this.database.product.findUnique({
        where: { nftTokenId: createProductDto.nftTokenId },
      });

      if (existingNftProduct) {
        throw new BadRequestException('NFT Token ID already in use');
      }
    }

    const product = await this.database.product.create({
      data: {
        symbol: createProductDto.symbol.toUpperCase(),
        name: createProductDto.name,
        description: createProductDto.description,
        minAmount: new Decimal(createProductDto.minAmount),
        maxAmount: createProductDto.maxAmount ? new Decimal(createProductDto.maxAmount) : null,
        aprBps: Math.round(createProductDto.apr * 100), // 转换为基点
        lockDays: createProductDto.lockDays,
        nftTokenId: createProductDto.nftTokenId,
        nftMetadata: createProductDto.nftMetadata,
        totalSupply: createProductDto.totalSupply,
        currentSupply: 0,
        isActive: createProductDto.isActive ?? true,
        startsAt: createProductDto.startsAt || new Date(),
        endsAt: createProductDto.endsAt,
      },
    });

    // 记录审计日志
    await this.createAuditLog(adminId, 'PRODUCT_CREATE', 'PRODUCT', product.id, {
      symbol: product.symbol,
      name: product.name,
      apr: createProductDto.apr,
      lockDays: product.lockDays,
    });

    this.logger.log(`Product created: ${product.symbol} by admin ${adminId}`);

    return {
      ...product,
      minAmount: product.minAmount.toNumber(),
      maxAmount: product.maxAmount?.toNumber(),
      apr: product.aprBps / 100,
    };
  }

  /**
   * 更新产品信息（管理员功能）
   */
  async update(id: string, updateProductDto: UpdateProductDto, adminId: string) {
    const existingProduct = await this.database.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // 如果更新符号，检查是否与其他产品冲突
    if (updateProductDto.symbol && updateProductDto.symbol !== existingProduct.symbol) {
      const symbolConflict = await this.database.product.findUnique({
        where: { symbol: updateProductDto.symbol.toUpperCase() },
      });

      if (symbolConflict) {
        throw new BadRequestException('Product symbol already exists');
      }
    }

    // 如果更新NFT Token ID，检查是否与其他产品冲突
    if (updateProductDto.nftTokenId && updateProductDto.nftTokenId !== existingProduct.nftTokenId) {
      const nftConflict = await this.database.product.findUnique({
        where: { nftTokenId: updateProductDto.nftTokenId },
      });

      if (nftConflict) {
        throw new BadRequestException('NFT Token ID already in use');
      }
    }

    // 准备更新数据
    const updateData: any = {};
    
    if (updateProductDto.symbol) {
      updateData.symbol = updateProductDto.symbol.toUpperCase();
    }
    if (updateProductDto.name) {
      updateData.name = updateProductDto.name;
    }
    if (updateProductDto.description !== undefined) {
      updateData.description = updateProductDto.description;
    }
    if (updateProductDto.minAmount) {
      updateData.minAmount = new Decimal(updateProductDto.minAmount);
    }
    if (updateProductDto.maxAmount !== undefined) {
      updateData.maxAmount = updateProductDto.maxAmount ? new Decimal(updateProductDto.maxAmount) : null;
    }
    if (updateProductDto.apr) {
      updateData.aprBps = Math.round(updateProductDto.apr * 100);
    }
    if (updateProductDto.lockDays) {
      updateData.lockDays = updateProductDto.lockDays;
    }
    if (updateProductDto.nftTokenId !== undefined) {
      updateData.nftTokenId = updateProductDto.nftTokenId;
    }
    if (updateProductDto.nftMetadata !== undefined) {
      updateData.nftMetadata = updateProductDto.nftMetadata;
    }
    if (updateProductDto.totalSupply !== undefined) {
      updateData.totalSupply = updateProductDto.totalSupply;
    }
    if (updateProductDto.isActive !== undefined) {
      updateData.isActive = updateProductDto.isActive;
    }
    if (updateProductDto.startsAt) {
      updateData.startsAt = new Date(updateProductDto.startsAt);
    }
    if (updateProductDto.endsAt !== undefined) {
      updateData.endsAt = updateProductDto.endsAt ? new Date(updateProductDto.endsAt) : null;
    }

    const updatedProduct = await this.database.product.update({
      where: { id },
      data: updateData,
    });

    // 记录审计日志
    await this.createAuditLog(adminId, 'PRODUCT_UPDATE', 'PRODUCT', id, {
      updatedFields: Object.keys(updateData),
      symbol: updatedProduct.symbol,
    });

    this.logger.log(`Product updated: ${updatedProduct.symbol} by admin ${adminId}`);

    return {
      ...updatedProduct,
      minAmount: updatedProduct.minAmount.toNumber(),
      maxAmount: updatedProduct.maxAmount?.toNumber(),
      apr: updatedProduct.aprBps / 100,
    };
  }

  /**
   * 删除产品（软删除，设置为不活跃）
   */
  async remove(id: string, adminId: string) {
    const product = await this.database.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 检查是否有活跃的仓位
    const activePositions = await this.database.position.count({
      where: {
        productId: id,
        status: 'ACTIVE',
      },
    });

    if (activePositions > 0) {
      throw new BadRequestException('Cannot delete product with active positions');
    }

    const updatedProduct = await this.database.product.update({
      where: { id },
      data: { isActive: false },
    });

    // 记录审计日志
    await this.createAuditLog(adminId, 'PRODUCT_DELETE', 'PRODUCT', id, {
      symbol: product.symbol,
      name: product.name,
    });

    this.logger.log(`Product deactivated: ${product.symbol} by admin ${adminId}`);

    return {
      id: updatedProduct.id,
      symbol: updatedProduct.symbol,
      deleted: true,
      deletedAt: new Date(),
    };
  }

  /**
   * 检查产品是否可购买
   */
  async checkAvailability(productId: string, amount: number): Promise<{
    available: boolean;
    reason?: string;
  }> {
    const product = await this.database.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { available: false, reason: 'Product not found' };
    }

    if (!product.isActive) {
      return { available: false, reason: 'Product is not active' };
    }

    if (product.startsAt > new Date()) {
      return { available: false, reason: 'Product sale has not started' };
    }

    if (product.endsAt && product.endsAt < new Date()) {
      return { available: false, reason: 'Product sale has ended' };
    }

    if (amount < product.minAmount.toNumber()) {
      return { available: false, reason: `Minimum investment amount is ${product.minAmount}` };
    }

    if (product.maxAmount && amount > product.maxAmount.toNumber()) {
      return { available: false, reason: `Maximum investment amount is ${product.maxAmount}` };
    }

    if (product.totalSupply) {
      const availableSupply = product.totalSupply - product.currentSupply;
      if (availableSupply <= 0) {
        return { available: false, reason: 'Product is sold out' };
      }
    }

    return { available: true };
  }

  /**
   * 创建审计日志
   */
  private async createAuditLog(
    actorId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: any,
  ): Promise<void> {
    try {
      await this.database.auditLog.create({
        data: {
          actorId,
          actorType: 'ADMIN',
          action,
          resourceType,
          resourceId,
          metadata,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }
}