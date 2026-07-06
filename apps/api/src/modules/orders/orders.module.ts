import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderGateway } from '../../common/gateways/order.gateway';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
