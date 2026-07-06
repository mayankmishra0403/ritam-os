/**
 * WhatsApp Service — Frontend service for communicating with
 * the Ritam OS WhatsApp notification API.
 *
 * All methods are fire-and-forget (non-blocking). Errors are
 * surfaced via returned objects, never thrown.
 */

const API_BASE = '/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function makeRequest(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: error.message, error: error.message };
  }
}

export const WhatsAppService = {
  /**
   * Send order confirmation to customer.
   * @param {string} phone - Customer phone number (with country code, e.g. 9198XXXXXXXX)
   * @param {number} orderNo - Order number
   * @param {string[]} items - Array of item strings (e.g. ["Butter Chicken (2)", "Naan (4)"])
   * @param {number} total - Total amount in INR
   */
  async sendOrderConfirmation(phone, orderNo, items, total) {
    return makeRequest('/whatsapp/send-order-confirmation', {
      phone,
      orderNo,
      items,
      total,
    });
  },

  /**
   * Notify that order is ready to serve.
   * @param {string} phone - Customer/waiter phone number
   * @param {number} orderNo - Order number
   * @param {number} tableNo - Table number
   */
  async sendOrderReady(phone, orderNo, tableNo) {
    return makeRequest('/whatsapp/send-order-ready', {
      phone,
      orderNo,
      tableNo,
    });
  },

  /**
   * Send payment receipt via WhatsApp.
   * @param {string} phone - Customer phone number
   * @param {number} orderNo - Order number
   * @param {number} amount - Amount paid
   * @param {string} method - Payment method (CASH, UPI, CARD, SPLIT)
   */
  async sendReceipt(phone, orderNo, amount, method) {
    return makeRequest('/whatsapp/send-receipt', {
      phone,
      orderNo,
      amount,
      method,
    });
  },

  /**
   * Send bill request with UPI details.
   * @param {string} phone - Customer phone number
   * @param {number} orderNo - Order number
   * @param {number} total - Total bill amount
   * @param {string} upiId - UPI ID for payment
   */
  async sendBill(phone, orderNo, total, upiId) {
    return makeRequest('/whatsapp/send-bill', {
      phone,
      orderNo,
      total,
      upiId,
    });
  },

  /**
   * Send a test WhatsApp message to verify integration.
   * @param {string} phone - Phone number to send test message to
   */
  async sendTest(phone) {
    return makeRequest('/whatsapp/test', { phone });
  },

  /**
   * Check WhatsApp API connection status.
   */
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE}/whatsapp/status`, {
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { connected: false, configured: false, error: error.message };
    }
  },
};
