import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  modifierIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateOrderDto {
  @IsUUID()
  outletId!: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

class UpdateOrderStatusDto {
  @IsEnum(['CONFIRMED', 'PREPARING', 'SERVED', 'PAID', 'CANCELLED'])
  status!: 'CONFIRMED' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCELLED';
}

class UpdateItemStatusDto {
  @IsString()
  status!: string;
}

class AddPaymentDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount!: number;

  @IsEnum(['CASH', 'UPI', 'CARD', 'SPLIT'])
  method!: 'CASH' | 'UPI' | 'CARD' | 'SPLIT';

  @IsOptional()
  @IsString()
  gatewayReference?: string;

  @IsOptional()
  @IsString()
  gatewayStatus?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('outletId', ParseUUIDPipe) outletId: string,
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.ordersService.findAll(
      req.tenantId,
      {
        outletId,
        status,
        tableId,
        dateFrom,
        dateTo,
      },
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.tenantId, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(req.tenantId, id, dto.status);
  }

  @Patch(':id/items/:itemId/status')
  updateItemStatus(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateItemStatusDto,
  ) {
    return this.ordersService.updateItemStatus(
      req.tenantId,
      id,
      itemId,
      dto.status,
    );
  }

  @Post(':id/payment')
  addPayment(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPaymentDto,
  ) {
    return this.ordersService.addPayment(req.tenantId, id, dto);
  }
}
