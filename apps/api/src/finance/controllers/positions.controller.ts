import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch,
  Query
} from '@nestjs/common';
import { PositionsService } from '../services/positions.service';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get('user/:userId')
  async getUserPositions(
    @Param('userId') userId: string,
    @Query() queryDto: any
  ) {
    return this.positionsService.getUserPositions(userId, queryDto);
  }

  @Get('stats')
  async getSystemStats() {
    return this.positionsService.getSystemPositionStats();
  }

  @Get('active')
  async getActivePositions() {
    return this.positionsService.getActivePositions();
  }

  @Get(':id')
  async getPosition(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.positionsService.getPosition(id, userId);
  }

  @Post()
  async createPosition(@Body() createPositionDto: {
    orderData: any;
    productData: any;
  }) {
    return this.positionsService.createPosition(
      createPositionDto.orderData, 
      createPositionDto.productData
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: { status: 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED' }
  ) {
    return this.positionsService.updatePositionStatus(id, updateDto.status);
  }

  @Post(':id/redeem')
  async redeemPosition(
    @Param('id') id: string,
    @Body() redeemDto: { userId: string }
  ) {
    return this.positionsService.redeemPosition(id, redeemDto.userId);
  }

  @Post(':id/payout')
  async recordPayout(
    @Param('id') id: string,
    @Body() payoutDto: { amount: number }
  ) {
    return this.positionsService.recordPayoutPayment(id, payoutDto.amount);
  }

  @Post('init-test-data')
  async initializeTestData() {
    await this.positionsService.initializeTestData();
    return { message: 'Test positions initialized successfully' };
  }
}