import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Inject } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  constructor(@Inject('OrdersService') private readonly ordersService: any) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: any) {
    // 在实际环境中，userId将从JWT token中获取
    const userId = 'user-test-001';
    return this.ordersService.create(createOrderDto, userId);
  }

  @Post('eth')
  createWithETH(@Body() createOrderDto: any) {
    // 在实际环境中，userId将从JWT token中获取
    const userId = 'user-test-001';
    // 设置支付类型为ETH
    const ethOrderDto = { ...createOrderDto, paymentType: 'ETH' };
    return this.ordersService.create(ethOrderDto, userId);
  }

  @Post(':id/confirm')
  confirmOrder(@Param('id') id: string, @Body() confirmDto: any) {
    // 在实际环境中，userId将从JWT token中获取
    const userId = 'user-test-001';
    return this.ordersService.confirmOrder(id, confirmDto, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(id, updateOrderDto);
  }
}