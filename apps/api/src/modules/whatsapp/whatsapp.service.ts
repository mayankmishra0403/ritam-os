import { Injectable, Logger } from '@nestjs/common';

/**
 * WhatsApp Service — integrates with MSG91 WhatsApp Business API
 * to send order updates, payment receipts, and notifications to customers.
 *
 * All messages are bilingual (Hindi + English mix) for Indian restaurant patrons.
 * Errors are caught gracefully — WhatsApp failures never crash the order flow.
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl = 'https://api.msg91.com/api/v5/whatsapp/';

  private get authKey(): string {
    return process.env.MSG91_AUTH_KEY || '544191ASK8RvrWN6a3aea68P1';
  }

  private get senderNumber(): string {
    return process.env.MSG91_SENDER_NUMBER || '919305804916';
  }

  // ─── Public API Methods ───────────────────────────────────────────────

  /**
   * Send a template-based WhatsApp message.
   * Templates need prior approval from MSG91/WhatsApp.
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    params: Record<string, string>,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'hi' },
        components: [
          {
            type: 'body',
            parameters: Object.entries(params).map(([key, value]) => ({
              type: 'text',
              text: value,
              parameter_name: key,
            })),
          },
        ],
      },
    };

    return this.makeRequest('whatsapp-outbound-message/', body);
  }

  /**
   * Send a plain text WhatsApp message.
   * Falls back gracefully on failure.
   */
  async sendTextMessage(
    to: string,
    message: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    };

    return this.makeRequest('whatsapp-outbound-message/', body);
  }

  // ─── Domain-Specific Messaging ────────────────────────────────────────

  /**
   * Send order confirmation to customer.
   * Message includes order number, items, total, and estimated time.
   *
   * @example
   *   ✅ *Order Confirmed!*
   *   Order #102
   *   Items: Butter Chicken (2), Naan (4)
   *   Total: ₹1,620
   *   Your order is being prepared. Estimated time: 20 minutes.
   *   - Ritam Restaurant
   */
  async sendOrderConfirmation(
    phone: string,
    orderNo: number,
    items: string[],
    total: number,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const message = `✅ *Order Confirm!* ✅\n\n*${orderNo}* का ऑर्डर कन्फर्म हुआ! आपका खाना तैयार हो रहा है।\n\n📋 *Items:*\n${items.join('\n')}\n\n💰 *Total:* ₹${total}\n⏱ *Estimated:* 20-25 minutes\n\nधन्यवाद! 🙏\n- Ritam Restaurant`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Notify that order is ready to be served.
   * Includes table number for the serving staff.
   *
   * @example
   *   🍽️ *Order Ready!*
   *   Order #102 is ready to be served at Table 3.
   *   - Ritam Restaurant
   */
  async sendOrderReady(
    phone: string,
    orderNo: number,
    tableNo: number,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const message = `🍽️ *Order Ready!* 🍽️\n\n*${orderNo}* का ऑर्डर तैयार है!\n\nटेबल *${tableNo}* पर सर्व करें।\n\nकृपया जल्दी से collect करें। ⏰\n\n- Ritam Restaurant`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Send payment receipt after successful payment.
   *
   * @example
   *   🧾 *Payment Receipt*
   *   Order #102
   *   Amount: ₹1,620
   *   Payment: UPI
   *   Thank you for dining with us!
   *   - Ritam Restaurant
   */
  async sendPaymentReceipt(
    phone: string,
    orderNo: number,
    amount: number,
    paymentMethod: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const methodLabels: Record<string, string> = {
      CASH: 'Cash 💵',
      UPI: 'UPI 📱',
      CARD: 'Card 💳',
      SPLIT: 'Split',
    };

    const method = methodLabels[paymentMethod] || paymentMethod;

    const message = `🧾 *Payment Receipt* 🧾\n\n*Order #${orderNo}*\n\nभुगतान सफलतापूर्वक प्राप्त हुआ! ✅\n\n💰 *Amount:* ₹${amount}\n💳 *Payment:* ${method}\n\nखाने का आनंद लेने के लिए धन्यवाद! 🙏\n\n- Ritam Restaurant`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Send bill request with UPI ID for payment.
   *
   * @example
   *   🧾 *Bill Ready*
   *   Order #102
   *   Total: ₹1,620
   *   Pay via UPI: ritam@paytm
   *   Or pay at counter.
   *   - Ritam Restaurant
   */
  async sendBillRequest(
    phone: string,
    orderNo: number,
    total: number,
    upiId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const message = `🧾 *Bill Ready* 🧾\n\n*Order #${orderNo}*\n\n💰 *Total:* ₹${total}\n\nकृपया भुगतान करें:\n📱 *UPI:* ${upiId}\n\nया काउंटर पर भुगतान करें।\n\nधन्यवाद! 🙏\n- Ritam Restaurant`;

    return this.sendTextMessage(phone, message);
  }

  // ─── Health Check ─────────────────────────────────────────────────────

  /**
   * Verify connectivity with MSG91 API by sending a test message.
   */
  async sendTestMessage(
    phone: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const message = `🔔 *Ritam OS WhatsApp Test* 🔔\n\nनमस्ते! 👋\n\nयह एक टेस्ट मैसेज है। आपका WhatsApp नोटिफिकेशन सिस्टम सही तरीके से काम कर रहा है।\n\n✅ *Connection Successful!*\n\n- Ritam Restaurant`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Check if MSG91 API credentials are configured.
   */
  async checkConnection(): Promise<{ connected: boolean; configured: boolean; sender: string }> {
    const configured = !!(process.env.MSG91_AUTH_KEY || '544191ASK8RvrWN6a3aea68P1');
    return {
      connected: configured,
      configured,
      sender: this.senderNumber,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────

  private async makeRequest(
    endpoint: string,
    body: any,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    try {
      this.logger.log(`MSG91 Request: POST ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authkey: this.authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        this.logger.error(
          `MSG91 API error (${response.status}) after ${duration}ms: ${JSON.stringify(data)}`,
        );
        return { success: false, error: data.message || data.error || `HTTP ${response.status}`, data };
      }

      this.logger.log(`MSG91 API success (${duration}ms): ${JSON.stringify(data)}`);
      return { success: true, data };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error(`MSG91 API request failed after ${duration}ms: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
