import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete,
  Query,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Inject } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor(@Inject('ProductsService') private readonly productsService: any) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() createProductDto: any) {
    // TODO: Get adminId from JWT token in real implementation
    const adminId = 'default-admin-id'; 
    return this.productsService.create(createProductDto, adminId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: any) {
    // TODO: Get adminId from JWT token in real implementation  
    const adminId = 'default-admin-id';
    return this.productsService.update(id, updateProductDto, adminId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // TODO: Get adminId from JWT token in real implementation
    const adminId = 'default-admin-id';
    return this.productsService.remove(id, adminId);
  }
}