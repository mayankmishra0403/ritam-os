/**
 * Invoice Data Generator
 * 
 * Takes order data and generates a complete GST-compliant invoice object
 * for Indian restaurant billing. Includes:
 * - Auto-generated invoice numbers (RITM-YYYY-XXXX)
 * - HSN code mapping
 * - Tax breakdown (CGST 5% + SGST 5%)
 * - Grand total in words (English)
 * - QR code data for digital verification
 */

// ─── HSN Code Mapping ───
// Standard HSN codes for restaurant services under GST
const HSN_MAP = {
  // Default for restaurant services
  DEFAULT: '9963',
  
  // Food and beverage serving services
  restaurant: '9963',
  food: '9963',
  beverage: '9963',
  
  // Specific items
  'butter chicken': '9963',
  'chicken curry': '9963',
  'dal makhani': '9963',
  'palak paneer': '9963',
  'paneer tikka': '9963',
  'chicken 65': '9963',
  'chicken biryani': '9963',
  'veg biryani': '9963',
  'spring rolls': '9963',
  'samosa': '9963',
  'tandoori roti': '9963',
  'naan': '9963',
  'garlic naan': '9963',
  'butter roti': '9963',
  'steamed rice': '9963',
  'jeera rice': '9963',
  'dal tadka': '9963',
  'mixed veg curry': '9963',
  'chana masala': '9963',
  'gulab jamun': '9963',
  'ice cream': '2105',
  'kheer': '9963',
  'masala chai': '9963',
  'cold drink': '2202',
  'lassi': '0403',
  'fresh lime soda': '2202',
  
  // Packaged items
  'water bottle': '2201',
  'mineral water': '2201',
  
  // Tobacco / Hookah
  hookah: '2403',
};

/**
 * Get HSN code for a given product name
 * @param {string} name - Product name
 * @returns {string} - 4-digit HSN code
 */
export function getHSNDescription(name) {
  if (!name) return HSN_MAP.DEFAULT;
  const key = name.toLowerCase().trim();
  return HSN_MAP[key] || HSN_MAP.DEFAULT;
}

/**
 * Get a description for an HSN code (for display)
 * @param {string} hsn - HSN code
 * @returns {string}
 */
export function getHSNLabel(hsn) {
  const labels = {
    '9963': 'Restaurant Services',
    '2105': 'Ice Cream',
    '2202': 'Beverages',
    '0403': 'Dairy Products',
    '2201': 'Packaged Water',
    '2403': 'Tobacco Products',
  };
  return labels[hsn] || 'General Services';
}

// ─── Number to Words (Indian Numbering System) ───

const ONES = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

/**
 * Convert a number less than 1000 to words
 * @param {number} n - Number (0-999)
 * @returns {string}
 */
function convertBelowThousand(n) {
  if (n === 0) return '';
  
  let result = '';
  
  if (n >= 100) {
    result += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  
  if (n >= 20) {
    result += TENS[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  
  if (n > 0) {
    result += ONES[n] + ' ';
  }
  
  return result.trim();
}

/**
 * Convert a number to words in Indian numbering system
 * Supports up to 99,99,99,999 (99 Crore+)
 * 
 * Indian system: Ones, Tens, Hundreds, Thousands, Ten-thousands,
 *                 Lakhs, Ten-lakhs, Crores, Ten-crores
 * 
 * @param {number} amount - Numeric amount
 * @returns {string} - Amount in words (e.g., "One Thousand Six Hundred Twenty Rupees Only")
 */
export function numberToWords(amount) {
  if (amount === 0) return 'Zero Rupees Only';
  if (amount < 0) return `Minus ${numberToWords(Math.abs(amount))}`;

  // Split into rupees and paise
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';

  let words = '';

  // Process in Indian number system: crore, lakh, thousand, hundred
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = Math.floor((rupees % 1000) / 100);
  const tens = rupees % 100;

  if (crore > 0) {
    words += convertBelowThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += convertBelowThousand(hundred) + ' Hundred ';
  }
  if (tens > 0) {
    if (hundred > 0) words += 'and ';
    words += convertBelowThousand(tens) + ' ';
  }

  words = words.trim() + ' Rupees';

  if (paise > 0) {
    words += ' and ' + convertBelowThousand(paise) + ' Paise';
  }

  words += ' Only';

  return words;
}

/**
 * Generate a complete invoice object from order data
 * @param {Object} orderData - Order/cart data from the POS store
 * @param {Object} restaurantInfo - Restaurant configuration
 * @returns {Object} - Complete invoice object
 */
export function generateInvoice(orderData, restaurantInfo) {
  const now = new Date();
  const invoiceNo = `RITM-${now.getFullYear()}-${String(
    orderData.orderId || Math.floor(Math.random() * 9999) + 1
  ).padStart(4, '0')}`;

  // Build items with HSN, tax breakdown
  const items = (orderData.items || []).map((item) => {
    const itemAmount = item.unitPrice * item.quantity;
    return {
      hsn: getHSNDescription(item.name),
      description: item.name,
      quantity: item.quantity,
      rate: item.unitPrice,
      amount: itemAmount,
      taxableValue: itemAmount,
      taxRate: 10, // 10% total GST (5% CGST + 5% SGST)
      cgst: itemAmount * 0.05,
      sgst: itemAmount * 0.05,
      cgstRate: 5,
      sgstRate: 5,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const cgstTotal = items.reduce((sum, item) => sum + item.cgst, 0);
  const sgstTotal = items.reduce((sum, item) => sum + item.sgst, 0);
  const discountAmount = orderData.discount || 0;
  const grandTotal = Math.max(0, subtotal + cgstTotal + sgstTotal - discountAmount);

  // Generate QR data for digital verification
  const qrData = JSON.stringify({
    inv: invoiceNo,
    amt: grandTotal.toFixed(2),
    dt: now.toISOString().split('T')[0],
    gst: restaurantInfo?.gstin || '',
  });

  return {
    // Invoice metadata
    invoiceNo,
    date: now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),

    // Restaurant info
    restaurant: {
      name: restaurantInfo?.name || 'Ritam Restaurant',
      address: restaurantInfo?.address || '123, MG Road, Bangalore',
      gstin: restaurantInfo?.gstin || '29ABCDE1234F1Z5',
      fssai: restaurantInfo?.fssai || '',
      phone: restaurantInfo?.phone || '',
      upiId: restaurantInfo?.upiId || 'ritam@paytm',
      outletCode: restaurantInfo?.outletCode || 'MAIN',
    },

    // Customer info
    customer: orderData.customerName || 'Guest',
    table: orderData.tableNumber
      ? `Table ${orderData.tableNumber}`
      : 'Takeaway',
    waiter: orderData.waiterName || 'Rajesh',

    // Itemized list
    items,

    // Tax summary
    subtotal,
    cgstRate: 5,
    sgstRate: 5,
    cgstTotal,
    sgstTotal,
    taxTotal: cgstTotal + sgstTotal,

    // Discount & total
    discount: discountAmount,
    grandTotal,
    inWords: numberToWords(grandTotal),

    // Payment details
    paymentMethod: orderData.paymentMethod || 'CASH',
    paymentRef: orderData.paymentRef || '',
    changeDue: orderData.changeDue || 0,

    // Digital verification
    qrData,
    
    // For KOT
    notes: orderData.notes || '',
  };
}

/**
 * Generate a simplified KOT (Kitchen Order Ticket) object
 * @param {Object} orderData
 * @returns {Object}
 */
export function generateKOT(orderData) {
  const now = new Date();
  return {
    kotNumber: `KOT-${now.getTime().toString().slice(-6)}`,
    tableNumber: orderData.tableNumber || 'Takeaway',
    waiterName: orderData.waiterName || 'Rajesh',
    date: now.toLocaleDateString('en-IN'),
    time: now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    items: (orderData.items || []).map((item) => ({
      name: item.name,
      nameHi: item.nameHi || '',
      quantity: item.quantity,
      modifiers: item.modifiers || [],
      notes: item.notes || '',
    })),
    notes: orderData.notes || '',
    course: orderData.course || 'MAIN', // 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE'
  };
}

/**
 * Generate demo invoice for testing
 * @returns {Object}
 */
export function generateDemoInvoice() {
  const demoOrder = {
    orderId: 1,
    customerName: 'Rahul Sharma',
    tableNumber: 3,
    waiterName: 'Rajesh',
    items: [
      { name: 'Butter Chicken', nameHi: 'बटर चिकन', unitPrice: 449, quantity: 2 },
      { name: 'Garlic Naan', nameHi: 'गार्लिक नान', unitPrice: 69, quantity: 4 },
      { name: 'Dal Makhani', nameHi: 'दाल मखनी', unitPrice: 299, quantity: 1 },
    ],
    subtotal: 1473,
    discount: 0,
    grandTotal: 1620.30,
    paymentMethod: 'UPI',
    paymentRef: 'UPI-REF-123456',
  };

  const restaurant = {
    name: 'Ritam Restaurant',
    address: 'Connaught Place, New Delhi - 110001',
    gstin: '07ABCDE1234F1Z5',
    fssai: '12345678901234',
    phone: '+91 9876543210',
    upiId: 'ritam@paytm',
  };

  return generateInvoice(demoOrder, restaurant);
}

export default {
  generateInvoice,
  generateKOT,
  generateDemoInvoice,
  numberToWords,
  getHSNDescription,
  getHSNLabel,
};
