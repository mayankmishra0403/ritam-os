import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Logger,
} from '@nestjs/common';
import { AggregatorService } from './aggregator.service';
import { ConfigureAggregatorDto, UpdateAggregatorStatusDto, AggregatorPlatformEnum } from './dto/aggregator-config.dto';
import { SwiggyWebhookPayload, ZomatoWebhookPayload } from './interfaces/aggregator.interface';

@Controller('aggregator')
export class AggregatorController {
  private readonly logger = new Logger(AggregatorController.name);

  constructor(private readonly aggregatorService: AggregatorService) {}

  // ──────────────────────────────────────────────
  //  Webhook Endpoints (no auth required — verified via webhook secret)
  // ──────────────────────────────────────────────

  @Post('swiggy-webhook')
  @HttpCode(HttpStatus.OK)
  async handleSwiggyWebhook(
    @Body() payload: SwiggyWebhookPayload,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-outlet-id') outletId: string,
  ) {
    this.logger.log(`Swiggy webhook received: orderId=${payload?.order_id}`);

    // In production, verify the webhook signature using the stored webhookSecret
    // const config = this.aggregatorService.getConfig(outletId, 'SWIGGY');
    // if (!config || !this.verifySignature(payload, signature, config.webhookSecret)) {
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }

    const order = this.aggregatorService.handleSwiggyWebhook(payload);

    return {
      success: true,
      message: 'Swiggy order received',
      data: order,
    };
  }

  @Post('zomato-webhook')
  @HttpCode(HttpStatus.OK)
  async handleZomatoWebhook(
    @Body() payload: ZomatoWebhookPayload,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-outlet-id') outletId: string,
  ) {
    this.logger.log(`Zomato webhook received: orderId=${payload?.order_id}`);

    // In production, verify the webhook signature
    // const config = this.aggregatorService.getConfig(outletId, 'ZOMATO');
    // if (!config || !this.verifySignature(payload, signature, config.webhookSecret)) {
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }

    const order = this.aggregatorService.handleZomatoWebhook(payload);

    return {
      success: true,
      message: 'Zomato order received',
      data: order,
    };
  }

  // ──────────────────────────────────────────────
  //  Configuration Endpoints
  // ──────────────────────────────────────────────

  @Post('configure')
  @HttpCode(HttpStatus.OK)
  async configure(
    @Body() dto: ConfigureAggregatorDto,
    @Req() req: any,
  ) {
    // In production, this would be tenant-protected via AuthGuard + TenantGuard
    const config = this.aggregatorService.configure(
      dto.outletId,
      dto.platform as any,
      {
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        restaurantId: dto.restaurantId,
        isActive: dto.isActive ?? true,
        autoAccept: dto.autoAccept ?? false,
        webhookSecret: dto.webhookSecret || '',
      },
    );

    return {
      success: true,
      message: `Aggregator configured for ${dto.platform}`,
      data: config,
    };
  }

  @Get('config/:outletId')
  async getConfig(
    @Param('outletId', ParseUUIDPipe) outletId: string,
    @Req() req: any,
  ) {
    const configs = this.aggregatorService.getAllConfigs(outletId);

    return {
      success: true,
      data: configs,
    };
  }

  @Get('config/:outletId/:platform')
  async getPlatformConfig(
    @Param('outletId', ParseUUIDPipe) outletId: string,
    @Param('platform') platform: string,
    @Req() req: any,
  ) {
    const normalizedPlatform = platform.toUpperCase() as any;
    const config = this.aggregatorService.getConfig(outletId, normalizedPlatform);

    return {
      success: true,
      data: config,
    };
  }

  // ──────────────────────────────────────────────
  //  Status Sync
  // ──────────────────────────────────────────────

  @Post('order-status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Body() dto: UpdateAggregatorStatusDto,
    @Req() req: any,
  ) {
    const order = await this.aggregatorService.updateAggregatorStatus(
      dto.orderId,
      dto.status as any,
      dto.platform as any,
      dto.platformOrderId,
    );

    return {
      success: true,
      message: `Order status updated to ${dto.status}`,
      data: order,
    };
  }

  // ──────────────────────────────────────────────
  //  Mock / Test Endpoints
  // ──────────────────────────────────────────────

  @Post('test/:platform')
  @HttpCode(HttpStatus.OK)
  async generateTestOrder(
    @Param('platform') platform: string,
    @Req() req: any,
  ) {
    const normalizedPlatform = platform.toUpperCase();

    if (normalizedPlatform === 'SWIGGY') {
      const mockPayload = this.aggregatorService.getMockSwiggyOrder();
      const order = this.aggregatorService.handleSwiggyWebhook(mockPayload);
      return {
        success: true,
        message: 'Mock Swiggy order generated',
        data: order,
      };
    } else if (normalizedPlatform === 'ZOMATO') {
      const mockPayload = this.aggregatorService.getMockZomatoOrder();
      const order = this.aggregatorService.handleZomatoWebhook(mockPayload);
      return {
        success: true,
        message: 'Mock Zomato order generated',
        data: order,
      };
    } else {
      return {
        success: false,
        message: `Unknown platform: ${platform}. Use 'SWIGGY' or 'ZOMATO'.`,
      };
    }
  }

  @Get('orders')
  async getAllOrders(@Req() req: any) {
    const orders = this.aggregatorService.getAllOrders();
    return {
      success: true,
      data: orders,
    };
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string, @Req() req: any) {
    const order = this.aggregatorService.getOrder(id);
    return {
      success: true,
      data: order,
    };
  }
}
