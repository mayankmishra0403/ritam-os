import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { IsString, IsOptional } from 'class-validator';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSalesSummary(
    @Req() req: any,
    @Query('outletId') outletId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getSalesSummary(req.tenantId, outletId, from, to);
  }

  @Get('top-items')
  getTopItems(
    @Req() req: any,
    @Query('outletId') outletId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getTopItems(req.tenantId, outletId, from, to);
  }

  @Get('payment-methods')
  getPaymentMethodBreakdown(
    @Req() req: any,
    @Query('outletId') outletId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getPaymentMethodBreakdown(
      req.tenantId,
      outletId,
      from,
      to,
    );
  }
}
