/**
 * ESC/POS Print Engine
 * 
 * A JavaScript class that generates ESC/POS byte arrays for printing
 * GST-compliant thermal receipts for Indian restaurants.
 * 
 * Usage:
 *   const engine = new PrintEngine();
 *   engine.init();
 *   engine.setCenter();
 *   engine.println('RITAM RESTAURANT');
 *   engine.setLeft();
 *   engine.println('Item                Qty   Amount');
 *   engine.printItem('Butter Chicken', 2, 898);
 *   engine.println('TOTAL: ₹1,620.30');
 *   engine.feed(3);
 *   engine.cut();
 *   const bytes = engine.getBuffer();
 */

import {
  ESC, GS, LF,
  CMD, textToBytes, padString, formatIndianNumber, divider,
} from './escpos';

const MAX_CHARS = 42; // Standard 80mm printer at font A (42 cols)

export class PrintEngine {
  constructor() {
    this.buffer = [];
  }

  /**
   * Add raw bytes to the buffer
   * @param {number|number[]|Uint8Array} data
   */
  _add(data) {
    if (typeof data === 'number') {
      this.buffer.push(data);
    } else if (Array.isArray(data)) {
      this.buffer.push(...data);
    } else if (data instanceof Uint8Array) {
      this.buffer.push(...data);
    }
  }

  /**
   * Add text encoded as UTF-8 bytes
   * @param {string} text
   */
  _addText(text) {
    const bytes = textToBytes(text);
    this.buffer.push(...bytes);
  }

  /**
   * Initialize printer — resets to factory defaults
   * @returns {PrintEngine}
   */
  init() {
    this._add(CMD.INIT);
    // Set standard mode, default line spacing
    this._add(CMD.LINE_SPACING_DEFAULT);
    // Default char code table
    this._add(CMD.CHAR_CODE_TABLE);
    return this;
  }

  /**
   * Set text alignment to center
   * @returns {PrintEngine}
   */
  setCenter() {
    this._add(CMD.ALIGN_CENTER);
    return this;
  }

  /**
   * Set text alignment to left
   * @returns {PrintEngine}
   */
  setLeft() {
    this._add(CMD.ALIGN_LEFT);
    return this;
  }

  /**
   * Set text alignment to right
   * @returns {PrintEngine}
   */
  setRight() {
    this._add(CMD.ALIGN_RIGHT);
    return this;
  }

  /**
   * Toggle bold text mode
   * @param {boolean} on
   * @returns {PrintEngine}
   */
  setBold(on) {
    this._add(on ? CMD.BOLD_ON : CMD.BOLD_OFF);
    return this;
  }

  /**
   * Toggle double height text mode
   * @param {boolean} on
   * @returns {PrintEngine}
   */
  setDoubleHeight(on) {
    this._add(on ? CMD.DOUBLE_HEIGHT_ON : CMD.DOUBLE_HEIGHT_OFF);
    return this;
  }

  /**
   * Toggle double width text mode
   * @param {boolean} on
   * @returns {PrintEngine}
   */
  setDoubleWidth(on) {
    this._add(on ? CMD.DOUBLE_WIDTH_ON : CMD.DOUBLE_WIDTH_OFF);
    return this;
  }

  /**
   * Set font size
   * @param {number} size - 0=normal (font A), 1=small (font B), 2=large (double height+width)
   * @returns {PrintEngine}
   */
  setFontSize(size) {
    switch (size) {
      case 1:
        this._add(CMD.FONT_SMALL);
        break;
      case 2:
        this._add(CMD.DOUBLE_HEIGHT_ON);
        this._add(CMD.DOUBLE_WIDTH_ON);
        break;
      default:
        this._add(CMD.FONT_NORMAL);
        this._add(CMD.DOUBLE_HEIGHT_OFF);
        break;
    }
    return this;
  }

  /**
   * Toggle underline mode
   * @param {boolean} on
   * @returns {PrintEngine}
   */
  setUnderline(on) {
    this._add(on ? CMD.UNDERLINE_ON : CMD.UNDERLINE_OFF);
    return this;
  }

  /**
   * Set character spacing
   * @param {number} n - Right-side character spacing in dots (default 0)
   * @returns {PrintEngine}
   */
  setCharSpacing(n = 0) {
    this._add(CMD.CHAR_SPACING(n));
    return this;
  }

  /**
   * Set line spacing
   * @param {number} n - Line spacing in 1/144 inch units (default 30)
   * @returns {PrintEngine}
   */
  setLineSpacing(n = 30) {
    this._add(CMD.LINE_SPACING(n));
    return this;
  }

  /**
   * Reset line spacing to default
   * @returns {PrintEngine}
   */
  resetLineSpacing() {
    this._add(CMD.LINE_SPACING_DEFAULT);
    return this;
  }

  /**
   * Print a line of text with automatic line feed.
   * Handles text longer than MAX_CHARS by wrapping.
   * @param {string} text
   * @returns {PrintEngine}
   */
  println(text = '') {
    if (text.length === 0) {
      this._add(CMD.LINE_FEED);
      return this;
    }

    // Handle lines that are longer than max chars by splitting
    if (text.length > MAX_CHARS) {
      const lines = this._wrapText(text, MAX_CHARS);
      for (const line of lines) {
        this._addText(line);
        this._add(CMD.LINE_FEED);
      }
    } else {
      this._addText(text);
      this._add(CMD.LINE_FEED);
    }
    return this;
  }

  /**
   * Print an empty line
   * @returns {PrintEngine}
   */
  blankLine() {
    this._add(CMD.LINE_FEED);
    return this;
  }

  /**
   * Print a divider line
   * @param {string} char - Character to repeat (default '=')
   * @returns {PrintEngine}
   */
  printDivider(char = '=') {
    this.println(divider(MAX_CHARS, char));
    return this;
  }

  /**
   * Print a formatted item line for thermal receipts:
   * Item name (left) | Qty (center, 4 chars) | Amount (right, 8 chars)
   * Uses fixed-width columns for alignment.
   * 
   * Example:
   *   Butter Chicken        2    898.00
   *   Garlic Naan           4    276.00
   * 
   * @param {string} name - Item name
   * @param {number} qty - Quantity
   * @param {number} amount - Total amount for the item
   * @returns {PrintEngine}
   */
  printItem(name, qty, amount) {
    // Layout: name (26 chars) | qty (4 chars) | amount (10 chars) = 42 chars
    // With 2-char padding: name(22) + pad(2) + qty(centered 4) + pad(2) + amount(right 10) = 40
    // Let's use: name(22) + qty(6) + amount(12) = 40... Hmm, let's use proper columns
    
    // Clean approach: 3 columns with fixed widths
    // Col 1: Item name (22 chars, left-aligned)
    // Col 2: Qty (6 chars, centered)  
    // Col 3: Amount (12 chars, right-aligned) = 40 chars total, with 2-char padding between
    
    // Actually for a proper GST receipt, let's use:
    // Item          Qty    Rate    Amount
    // Butter Chicken  2  449.00   898.00
    // 
    // Columns: name(18) + qty(6) + rate(8) + amount(8) = 40 + padding
    
    // Simplest reliable approach: manual string building with fixed widths
    const nameStr = padString(name, 20, 'left').slice(0, 20);
    const qtyStr = padString(String(qty), 5, 'center');
    const amtStr = padString(formatIndianNumber(amount), 13, 'right');
    
    this.println(`${nameStr}${qtyStr}${amtStr}`);
    return this;
  }

  /**
   * Print a total line (label on left, amount on right)
   * @param {string} label - Label text (e.g., "Subtotal", "CGST (5%)")
   * @param {number} amount - Amount value
   * @param {boolean} [highlight=false] - Whether to highlight this line (bold)
   * @returns {PrintEngine}
   */
  printTotal(label, amount, highlight = false) {
    if (highlight) this.setBold(true);
    
    const labelStr = padString(label, 24, 'left').slice(0, 24);
    const amtStr = padString(`₹${formatIndianNumber(amount)}`, 16, 'right');
    this.println(`${labelStr}${amtStr}`);
    
    if (highlight) this.setBold(false);
    return this;
  }

  /**
   * Print a key-value pair (e.g., "Invoice No: RITM-2026-0001")
   * @param {string} key
   * @param {string} value
   * @returns {PrintEngine}
   */
  printKeyValue(key, value) {
    const line = `${key}: ${value}`;
    this.println(line);
    return this;
  }

  /**
   * Print a section header (centered, surrounded by dividers)
   * @param {string} title
   * @returns {PrintEngine}
   */
  printSection(title) {
    this.printDivider('-');
    this.setCenter();
    this.setBold(true);
    this.println(title);
    this.setBold(false);
    this.setLeft();
    return this;
  }

  /**
   * Print multi-line text (supports \n in string)
   * @param {string} text
   * @returns {PrintEngine}
   */
  printMultiline(text) {
    const lines = text.split('\n');
    for (const line of lines) {
      this.println(line);
    }
    return this;
  }

  /**
   * Print a QR code on the receipt.
   * QR code module size depends on printer model.
   * NOTE: Not all thermal printers support QR codes natively.
   * For broader compatibility, consider rendering a text-based QR code
   * as block characters.
   * @param {string} data - Data to encode
   * @param {number} [size=6] - Module size (1-16)
   * @param {number} [ec=48] - Error correction (48=L, 49=M, 50=Q, 51=H)
   * @returns {PrintEngine}
   */
  printQRCode(data, size = 6, ec = 48) {
    try {
      this._add(CMD.QRCODE_MODEL);
      this._add(CMD.QRCODE_SIZE(size));
      this._add(CMD.QRCODE_EC(ec));
      this._add(CMD.QRCODE_DATA(data));
      this._add(CMD.QRCODE_PRINT);
      this._add(CMD.LINE_FEED);
    } catch (e) {
      // If QR code fails, just print the data as text
      this.println(`QR: ${data}`);
    }
    return this;
  }

  /**
   * Print a simple text-based QR code using block characters.
   * Serves as a visual placeholder when QR commands are not supported.
   * @param {string} label - Label for the QR (e.g., "UPI: ritam@paytm")
   * @returns {PrintEngine}
   */
  printQRPlaceholder(label) {
    this.setCenter();
    this.println('┌──────────────────────────┐');
    this.println('│  ██  ██████  ██  ██████  │');
    this.println('│  ██  ██        ██    ██  │');
    this.println('│      ████    ████  ██    │');
    this.println('│  ██  ██      ██    ████  │');
    this.println('│    ██████  ██  ██████    │');
    this.println('│        SCAN TO PAY       │');
    this.println('└──────────────────────────┘');
    this.setLeft();
    this.println(label);
    return this;
  }

  /**
   * Feed paper N lines
   * @param {number} lines
   * @returns {PrintEngine}
   */
  feed(lines = 1) {
    if (lines <= 0) return this;
    // For small feeds, use individual line feeds
    if (lines <= 5) {
      for (let i = 0; i < lines; i++) {
        this._add(CMD.LINE_FEED);
      }
    } else {
      // For larger feeds, use the feed command
      const n = Math.min(lines, 255);
      this._add(CMD.FEED(n));
    }
    return this;
  }

  /**
   * Cut paper (full cut)
   * @param {boolean} [partial=false] - If true, partial cut
   * @returns {PrintEngine}
   */
  cut(partial = false) {
    this._add(partial ? CMD.CUT_PARTIAL : CMD.CUT_FULL);
    return this;
  }

  /**
   * Open cash drawer (pulse on pin 2)
   * @param {boolean} [alternate=false] - If true, use alternate pin (pin 5)
   * @returns {PrintEngine}
   */
  openDrawer(alternate = false) {
    this._add(alternate ? CMD.DRAWER_ALT : CMD.DRAWER);
    return this;
  }

  /**
   * Get the complete byte array buffer ready for sending to printer
   * @returns {Uint8Array}
   */
  getBuffer() {
    return new Uint8Array(this.buffer);
  }

  /**
   * Get the total size of the buffer in bytes
   * @returns {number}
   */
  getBufferSize() {
    return this.buffer.length;
  }

  /**
   * Clear the buffer to start fresh
   * @returns {PrintEngine}
   */
  clear() {
    this.buffer = [];
    return this;
  }

  /**
   * Generate a complete GST-compliant receipt for restaurant billing
   * @param {Object} invoice - Invoice data from invoiceGenerator
   * @param {Object} [options]
   * @param {boolean} [options.showQR=true] - Whether to include QR code
   * @param {boolean} [options.showItems=true] - Whether to show item details
   * @returns {PrintEngine}
   */
  generateReceipt(invoice, options = {}) {
    const { showQR = true, showItems = true } = options;
    const r = invoice.restaurant;

    // Initialize
    this.init();
    this.setCenter();

    // ── Header ──
    this.setBold(true);
    this.setDoubleHeight(true);
    this.println(r.name || 'RITAM RESTAURANT');
    this.setDoubleHeight(false);
    this.setBold(false);

    this.setFontSize(1); // Small font for address
    this.println(r.address || '');
    this.println(`GSTIN: ${r.gstin || ''}`);
    if (r.fssai) this.println(`FSSAI: ${r.fssai}`);
    this.setFontSize(0);

    this.feed(1);
    this.printDivider('-');

    // ── Invoice Meta ──
    this.setLeft();
    this.println(`Invoice #: ${invoice.invoiceNo}`);
    this.println(`Date: ${invoice.date}  ${invoice.time}`);
    this.println(`Customer: ${invoice.customer}`);
    this.println(`Table: ${invoice.table || 'Takeaway'}`);
    this.printDivider('-');

    // ── Items ──
    if (showItems && invoice.items.length > 0) {
      this.setBold(true);
      this.println('#  Item                      Qty   Amount');
      this.setBold(false);
      this.println('─'.repeat(MAX_CHARS));

      invoice.items.forEach((item, index) => {
        const num = `${index + 1}.`;
        const nameStr = padString(item.description, 18, 'left').slice(0, 18);
        const qtyStr = padString(String(item.quantity), 5, 'center');
        const amtStr = padString(`₹${formatIndianNumber(item.amount)}`, 12, 'right');
        this.println(`${num.padEnd(3)}${nameStr}${qtyStr}${amtStr}`);
        
        // Print HSN on the next line in small font
        if (item.hsn) {
          this.setFontSize(1);
          this.println(`  HSN: ${item.hsn}  @ ₹${formatIndianNumber(item.rate)}/item`);
          this.setFontSize(0);
        }
      });
    } else {
      // Generic items
      invoice.items.forEach((item, index) => {
        this.printItem(item.description, item.quantity, item.amount);
      });
    }

    this.printDivider('-');

    // ── Totals ──
    if (invoice.discount > 0) {
      this.printTotal('Subtotal', invoice.subtotal);
      this.printTotal(`CGST (5%)`, invoice.cgstTotal);
      this.printTotal(`SGST (5%)`, invoice.sgstTotal);
      this.printTotal('Discount', invoice.discount);
    } else {
      this.printTotal('Subtotal', invoice.subtotal);
      this.printTotal(`CGST (5%)`, invoice.cgstTotal);
      this.printTotal(`SGST (5%)`, invoice.sgstTotal);
    }

    this.printDivider('=');
    
    // Grand Total
    this.setCenter();
    this.setBold(true);
    this.setDoubleHeight(true);
    this.println(`TOTAL: ₹${formatIndianNumber(invoice.grandTotal)}`);
    this.setDoubleHeight(false);
    this.setBold(false);
    this.setLeft();

    this.printDivider('-');

    // ── Total in Words ──
    if (invoice.inWords) {
      this.setFontSize(1);
      this.println(`Amount in Words:`);
      this.println(invoice.inWords);
      this.setFontSize(0);
      this.feed(1);
    }

    // ── Payment Details ──
    this.setLeft();
    this.println(`Payment: ${invoice.paymentMethod || 'N/A'}`);
    if (invoice.paymentRef) {
      this.println(`Ref: ${invoice.paymentRef}`);
    }
    if (invoice.changeDue > 0) {
      this.println(`Change Due: ₹${formatIndianNumber(invoice.changeDue)}`);
    }
    this.printDivider('-');

    // ── QR Code (digital verification / UPI) ──
    if (showQR) {
      this.feed(1);
      this.setCenter();
      // Placeholder QR
      this.printQRPlaceholder(`UPI: ${r.upiId || 'ritam@paytm'}`);
      this.setLeft();
      this.feed(1);
    }

    // ── Footer ──
    this.setCenter();
    this.setBold(true);
    this.println('Thank you! Visit again :)');
    this.setBold(false);
    this.setFontSize(1);
    this.println('धन्यवाद! फिर आइएगा :)');
    this.setFontSize(0);
    this.println('Bill Generated by Ritam OS');
    
    this.feed(4);
    this.cut();

    return this;
  }

  /**
   * Generate a KOT (Kitchen Order Ticket) receipt
   * @param {Object} orderData
   * @param {number} orderData.tableNumber
   * @param {string} orderData.waiterName
   * @param {Array} orderData.items - Cart items
   * @param {string} [orderData.notes] - Order notes
   * @returns {PrintEngine}
   */
  generateKOT(orderData) {
    this.init();
    
    // Header
    this.setCenter();
    this.setBold(true);
    this.setDoubleHeight(true);
    this.println('KITCHEN ORDER');
    this.setDoubleHeight(false);
    this.setBold(false);
    this.printDivider('-');

    // KOT meta
    this.setLeft();
    this.setBold(true);
    this.println(`KOT #: ${orderData.kotNumber || Date.now().toString().slice(-6)}`);
    this.setBold(false);
    this.println(`Table: ${orderData.tableNumber}`);
    this.println(`Waiter: ${orderData.waiterName || 'Rajesh'}`);
    this.println(`Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`);
    this.printDivider('-');

    // Items
    this.setBold(true);
    this.println('#  Item                    Qty');
    this.setBold(false);
    this.println('─'.repeat(MAX_CHARS));
    
    (orderData.items || []).forEach((item, index) => {
      const num = `${index + 1}.`;
      const nameStr = padString(item.name || item.description, 26, 'left').slice(0, 26);
      const qtyStr = padString(String(item.quantity), 8, 'center');
      this.println(`${num.padEnd(3)}${nameStr}${qtyStr}`);
      
      // Print modifiers if any
      if (item.modifiers && item.modifiers.length > 0) {
        this.setFontSize(1);
        item.modifiers.forEach(mod => {
          this.println(`     + ${mod.name || mod}`);
        });
        this.setFontSize(0);
      }
    });

    // Order notes
    if (orderData.notes) {
      this.feed(1);
      this.setBold(true);
      this.println('NOTES:');
      this.setBold(false);
      this.println(orderData.notes);
    }

    this.printDivider('-');
    this.feed(2);
    this.cut();

    return this;
  }

  /**
   * Generate a test/sample receipt for printer testing
   * @returns {PrintEngine}
   */
  generateTestReceipt() {
    this.init();
    this.setCenter();
    
    this.setBold(true);
    this.setDoubleHeight(true);
    this.println('TEST PRINT');
    this.setDoubleHeight(false);
    this.setBold(false);
    
    this.println('Ritam POS Printer Test');
    this.feed(1);
    this.printDivider('-');
    
    this.setLeft();
    this.println('Printer Model: ESC/POS Compatible');
    this.println('Date: ' + new Date().toLocaleDateString('en-IN'));
    this.println('Time: ' + new Date().toLocaleTimeString('en-IN'));
    this.feed(1);
    
    this.setCenter();
    this.println('Font Styles Test:');
    this.setLeft();
    this.println('Normal text');
    this.setBold(true);
    this.println('Bold text');
    this.setBold(false);
    this.setDoubleHeight(true);
    this.println('Double Height');
    this.setDoubleHeight(false);
    
    this.feed(1);
    this.printDivider('-');
    
    this.println('Column Alignment Test:');
    this.printItem('Test Item 1', 2, 100);
    this.printItem('Test Item 2 Long Name', 1, 250.50);
    this.printItem('Samosa', 3, 447);
    
    this.printDivider('-');
    this.printTotal('Subtotal', 797.50);
    this.printTotal('CGST (5%)', 39.88);
    this.printTotal('SGST (5%)', 39.88);
    this.printDivider('=');
    
    this.setCenter();
    this.setBold(true);
    this.setDoubleHeight(true);
    this.println('TOTAL: ₹877.26');
    this.setDoubleHeight(false);
    this.setBold(false);
    
    this.feed(1);
    this.setCenter();
    this.println('Indian Rupee: ₹ (UTF-8 OK)');
    this.println('Hindi: नमस्ते, रितम ओएस');
    this.feed(3);
    this.cut();
    
    return this;
  }

  /**
   * Wrap text to fit a given width
   * @private
   * @param {string} text
   * @param {number} maxWidth
   * @returns {string[]}
   */
  _wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxWidth) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // If any line is still too long, hard-split it
    return lines.flatMap(line => {
      if (line.length <= maxWidth) return [line];
      const chunks = [];
      for (let i = 0; i < line.length; i += maxWidth) {
        chunks.push(line.slice(i, i + maxWidth));
      }
      return chunks;
    });
  }
}

export default PrintEngine;
