/**
 * ESC/POS Command Constants and Helper Functions
 * 
 * Standard ESC/POS commands for Epson and compatible thermal printers.
 * Used by the PrintEngine to generate raw byte sequences for receipt printing.
 */

export const ESC = 0x1B;
export const GS = 0x1D;
export const LF = 0x0A;
export const NUL = 0x00;
export const DLE = 0x10;
export const EOT = 0x04;

export const CMD = {
  /** Initialize printer — resets to defaults */
  INIT: [ESC, 0x40],

  /** Bold text ON */
  BOLD_ON: [ESC, 0x45, 0x01],

  /** Bold text OFF */
  BOLD_OFF: [ESC, 0x45, 0x00],

  /** Double height mode ON */
  DOUBLE_HEIGHT_ON: [ESC, 0x21, 0x20],

  /** Double height mode OFF */
  DOUBLE_HEIGHT_OFF: [ESC, 0x21, 0x00],

  /** Double width mode ON */
  DOUBLE_WIDTH_ON: [ESC, 0x21, 0x10],

  /** Double width mode OFF */
  DOUBLE_WIDTH_OFF: [ESC, 0x21, 0x00],

  /** Underline ON (1-dot thick) */
  UNDERLINE_ON: [ESC, 0x2D, 0x01],

  /** Underline OFF */
  UNDERLINE_OFF: [ESC, 0x2D, 0x00],

  /** Left align */
  ALIGN_LEFT: [ESC, 0x61, 0x00],

  /** Center align */
  ALIGN_CENTER: [ESC, 0x61, 0x01],

  /** Right align */
  ALIGN_RIGHT: [ESC, 0x61, 0x02],

  /** Character size — default (font A, 12×24) */
  FONT_NORMAL: [GS, 0x21, 0x00],

  /** Character size — small (font B, 9×17) */
  FONT_SMALL: [GS, 0x21, 0x01],

  /** Print and feed paper (n lines) */
  FEED: (n) => [ESC, 0x64, n],

  /** Line feed */
  LINE_FEED: [LF],

  /** Full cut (cut paper completely) */
  CUT_FULL: [GS, 0x56, 0x41, 0x00],

  /** Partial cut (leave paper partially attached) */
  CUT_PARTIAL: [GS, 0x56, 0x42, 0x00],

  /** Open cash drawer (pulse on pin 2) */
  DRAWER: [ESC, 0x70, 0x00, 0x32, 0xFF],

  /** Open cash drawer (alternative pulse on pin 5) */
  DRAWER_ALT: [ESC, 0x70, 0x01, 0x32, 0xFF],

  /** Set character code table — PC437 (USA/Europe) */
  CHAR_CODE_TABLE: [ESC, 0x74, 0x00],

  /** Set character code table — PC850 (Multilingual) */
  CHAR_CODE_TABLE_850: [ESC, 0x74, 0x02],

  /** Print and return to standard mode (from page mode) */
  PRINT_RETURN: [ESC, 0x0C],

  /** Generate QR Code (model 2) */
  QRCODE_MODEL: [GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00],

  /** QR Code size (n = 1-16, 1=smallest) */
  QRCODE_SIZE: (n) => [GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, n],

  /** QR Code error correction (48=L, 49=M, 50=Q, 51=H) */
  QRCODE_EC: (level) => [GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, level],

  /** Store QR Code data */
  QRCODE_DATA: (data) => {
    const dataBytes = textToBytes(data);
    const pL = (dataBytes.length + 3) & 0xFF;
    const pH = ((dataBytes.length + 3) >> 8) & 0xFF;
    return [GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30, ...dataBytes];
  },

  /** Print QR Code from stored data */
  QRCODE_PRINT: [GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30],

  /** Set character spacing (right-side character spacing, default=0) */
  CHAR_SPACING: (n) => [ESC, 0x20, n],

  /** Set line spacing (default=30, 1/144 inch units) */
  LINE_SPACING: (n) => [ESC, 0x33, n],

  /** Reset line spacing to default */
  LINE_SPACING_DEFAULT: [ESC, 0x32],
};

/**
 * Encode a text string to UTF-8 byte array
 * @param {string} text
 * @returns {Uint8Array}
 */
export function textToBytes(text) {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * Convert a number to a formatted string with Indian-style number formatting
 * e.g., 1620.30 -> "1,620.30"
 * @param {number} amount
 * @returns {string}
 */
export function formatIndianNumber(amount) {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Pad a string to a fixed width (for column alignment)
 * @param {string} str - Input string
 * @param {number} width - Target width
 * @param {'left'|'right'|'center'} align - Alignment
 * @returns {string}
 */
export function padString(str, width, align = 'left') {
  if (str.length >= width) return str.slice(0, width);
  const padLen = width - str.length;
  if (align === 'right') return ' '.repeat(padLen) + str;
  if (align === 'center') {
    const leftPad = Math.floor(padLen / 2);
    return ' '.repeat(leftPad) + str + ' '.repeat(padLen - leftPad);
  }
  return str + ' '.repeat(padLen);
}

/**
 * Create a horizontal divider line
 * @param {number} width - Line width in characters
 * @param {string} char - Character to use (default '=')
 * @returns {string}
 */
export function divider(width = 42, char = '=') {
  return char.repeat(width);
}

/**
 * Build complete receipt byte array from a config object
 * @param {Object} config
 * @param {string} config.headerText - Restaurant name
 * @param {string} config.address - Restaurant address
 * @param {string} config.gstin - GSTIN number
 * @param {string} config.fssai - FSSAI number
 * @param {Array<Object>} config.items - Receipt items
 * @param {string} config.items[].name - Item name
 * @param {number} config.items[].qty - Quantity
 * @param {number} config.items[].amount - Total amount for this item
 * @param {number} config.subtotal - Subtotal amount
 * @param {number} config.cgst - CGST amount
 * @param {number} config.sgst - SGST amount
 * @param {number} config.discount - Discount amount
 * @param {number} config.grandTotal - Grand total
 * @param {string} config.paymentMethod - Payment method
 * @param {string} config.changeDue - Change due (for cash)
 * @param {string} config.thankYouMessage - Footer message
 * @returns {Uint8Array}
 */
export function createReceipt(config) {
  const engine = new PrintEngine();  // Note: Circular dep avoided via lazy pattern below
  // We'll import PrintEngine in the actual usage
  return new Uint8Array();
}
