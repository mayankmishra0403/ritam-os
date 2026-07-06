import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WhatsappService } from './whatsapp.service';

// ─── DTOs ────────────────────────────────────────────────────────────────

class SendOrderConfirmationDto {
  phone!: string;
  orderNo!: number;
  items!: string[];
  total!: number;
}

class SendOrderReadyDto {
  phone!: string;
  orderNo!: number;
  tableNo!: number;
}

class SendReceiptDto {
  phone!: string;
  orderNo!: number;
  amount!: number;
  method!: string;
}

class SendBillDto {
  phone!: string;
  orderNo!: number;
  total!: number;
  upiId!: string;
}

class SendTestDto {
  phone!: string;
}

// ─── Controller ──────────────────────────────────────────────────────────

@UseGuards(AuthGuard('jwt'))
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Send order confirmation to customer via WhatsApp.
   * POST /api/v1/whatsapp/send-order-confirmation
   */
  @Post('send-order-confirmation')
  @HttpCode(HttpStatus.OK)
  async sendOrderConfirmation(@Body() dto: SendOrderConfirmationDto) {
    const result = await this.whatsappService.sendOrderConfirmation(
      dto.phone,
      dto.orderNo,
      dto.items,
      dto.total,
    );
    return {
      success: result.success,
      message: result.success
        ? 'Order confirmation sent via WhatsApp'
        : 'Failed to send WhatsApp notification',
      error: result.error,
    };
  }

  /**
   * Notify customer that order is ready to serve.
   * POST /api/v1/whatsapp/send-order-ready
   */
  @Post('send-order-ready')
  @HttpCode(HttpStatus.OK)
  async sendOrderReady(@Body() dto: SendOrderReadyDto) {
    const result = await this.whatsappService.sendOrderReady(
      dto.phone,
      dto.orderNo,
      dto.tableNo,
    );
    return {
      success: result.success,
      message: result.success
        ? 'Order ready notification sent via WhatsApp'
        : 'Failed to send WhatsApp notification',
      error: result.error,
    };
  }

  /**
   * Send payment receipt to customer via WhatsApp.
   * POST /api/v1/whatsapp/send-receipt
   */
  @Post('send-receipt')
  @HttpCode(HttpStatus.OK)
  async sendReceipt(@Body() dto: SendReceiptDto) {
    const result = await this.whatsappService.sendPaymentReceipt(
      dto.phone,
      dto.orderNo,
      dto.amount,
      dto.method,
    );
    return {
      success: result.success,
      message: result.success
        ? 'Payment receipt sent via WhatsApp'
        : 'Failed to send WhatsApp notification',
      error: result.error,
    };
  }

  /**
   * Send bill request with UPI details via WhatsApp.
   * POST /api/v1/whatsapp/send-bill
   */
  @Post('send-bill')
  @HttpCode(HttpStatus.OK)
  async sendBill(@Body() dto: SendBillDto) {
    const result = await this.whatsappService.sendBillRequest(
      dto.phone,
      dto.orderNo,
      dto.total,
      dto.upiId,
    );
    return {
      success: result.success,
      message: result.success
        ? 'Bill sent via WhatsApp'
        : 'Failed to send WhatsApp notification',
      error: result.error,
    };
  }

  /**
   * Send a test WhatsApp message to verify connectivity.
   * POST /api/v1/whatsapp/test
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTest(@Body() dto: SendTestDto) {
    const result = await this.whatsappService.sendTestMessage(dto.phone);
    return {
      success: result.success,
      message: result.success
        ? 'Test message sent via WhatsApp'
        : 'Failed to send test message',
      error: result.error,
    };
  }

  /**
   * Check WhatsApp API connection status.
   * GET /api/v1/whatsapp/status
   */
  @Get('status')
  async getStatus() {
    return this.whatsappService.checkConnection();
  }
}
