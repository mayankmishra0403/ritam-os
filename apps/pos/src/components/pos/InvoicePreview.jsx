/**
 * InvoicePreview Component
 * 
 * Full-screen modal showing a GST-compliant invoice/receipt preview
 * before printing. Features a realistic receipt layout with:
 * - Restaurant header with logo placeholder
 * - Invoice metadata (invoice #, date, table, waiter)
 * - Itemized table with HSN codes
 * - Tax breakdown (CGST + SGST)
 * - Total in words (English + Hindi)
 * - QR code placeholder for digital verification
 * - Payment details
 * - Action buttons: Print, Download PDF, Share WhatsApp
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  FileDown,
  Share2,
  Check,
  Loader2,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PrintEngine } from '../../services/printEngine';
import usePrinterStore from '../../store/printerStore';
import { formatIndianNumber } from '../../services/escpos';

// ─── Stub printer connection (for demo/fallback) ───
async function sendToPrinter(bytes) {
  // In production, this would use WebUSB, Bluetooth, or Network socket
  // For now, we create a blob download to simulate
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${Date.now()}.bin`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Simulate printer delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return true;
}

// ─── Format helpers ───
function formatDate(dateStr, timeStr) {
  if (dateStr && timeStr) return `${dateStr} ${timeStr}`;
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── QR Code Placeholder ───
function QRPlaceholder({ data, size = 80 }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="bg-white border-2 border-gray-800 rounded-lg p-1"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-0.5">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${
                [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i)
                  ? 'bg-black'
                  : 'bg-white'
              }`}
            />
          ))}
        </div>
      </div>
      <span className="text-[8px] text-gray-400 font-mono">Scan to verify</span>
    </div>
  );
}

// ─── Receipt Content ───
function ReceiptContent({ invoice, compact = false }) {
  const r = invoice.restaurant || {};
  const items = invoice.items || [];

  return (
    <div className="font-mono text-xs leading-relaxed text-gray-800">
      {/* Restaurant Header */}
      <div className="text-center mb-3">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-1">
          <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
        </div>
        <h2 className="text-base font-bold tracking-tight">{r.name || 'Ritam Restaurant'}</h2>
        <p className="text-[10px] text-gray-500">{r.address || ''}</p>
        {r.gstin && (
          <p className="text-[10px] text-gray-500">GSTIN: {r.gstin}</p>
        )}
        {r.fssai && (
          <p className="text-[10px] text-gray-500">FSSAI: {r.fssai}</p>
        )}
        {r.phone && (
          <p className="text-[10px] text-gray-500">Tel: {r.phone}</p>
        )}
      </div>

      <div className="border-t border-dashed border-gray-300 my-1.5" />

      {/* Invoice Metadata */}
      <div className="space-y-0.5 mb-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Invoice #:</span>
          <span className="font-semibold">{invoice.invoiceNo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date:</span>
          <span>{formatDate(invoice.date, invoice.time)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Customer:</span>
          <span>{invoice.customer || 'Guest'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Table:</span>
          <span>{invoice.table || 'Takeaway'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Waiter:</span>
          <span>{invoice.waiter || 'Rajesh'}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 my-1.5" />

      {/* Column Headers */}
      <div className="flex text-[10px] text-gray-500 font-semibold mb-1">
        <span className="w-[4%]">#</span>
        <span className="w-[44%]">Item</span>
        <span className="w-[10%] text-center">Qty</span>
        <span className="w-[18%] text-right">Rate</span>
        <span className="w-[24%] text-right">Amount</span>
      </div>

      <div className="border-t border-gray-200 mb-1" />

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-2">No items</p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="mb-1.5">
            <div className="flex text-[11px]">
              <span className="w-[4%] text-gray-400">{index + 1}.</span>
              <span className="w-[44%] font-medium truncate">{item.description}</span>
              <span className="w-[10%] text-center">{item.quantity}</span>
              <span className="w-[18%] text-right">
                {compact ? '' : `₹${formatIndianNumber(item.rate)}`}
              </span>
              <span className="w-[24%] text-right font-medium">
                ₹{formatIndianNumber(item.amount)}
              </span>
            </div>
            {!compact && item.hsn && (
              <div className="flex text-[9px] text-gray-400 pl-[4%]">
                <span>HSN: {item.hsn}</span>
                <span className="ml-3">@ ₹{formatIndianNumber(item.rate)}/item</span>
              </div>
            )}
            {/* Tax line per item */}
            {!compact && (
              <div className="flex text-[9px] text-gray-400 pl-[4%]">
                <span>CGST: ₹{formatIndianNumber(item.cgst)}</span>
                <span className="ml-3">SGST: ₹{formatIndianNumber(item.sgst)}</span>
              </div>
            )}
          </div>
        ))
      )}

      <div className="border-t border-gray-200 my-1.5" />

      {/* Totals */}
      <div className="space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>₹{formatIndianNumber(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">CGST @ {invoice.cgstRate || 5}%</span>
          <span>₹{formatIndianNumber(invoice.cgstTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">SGST @ {invoice.sgstRate || 5}%</span>
          <span>₹{formatIndianNumber(invoice.sgstTotal)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{formatIndianNumber(invoice.discount)}</span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-gray-800 my-1.5" />

      {/* Grand Total */}
      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span className="text-lg">₹{formatIndianNumber(invoice.grandTotal)}</span>
      </div>

      <div className="border-t border-gray-300 my-1.5" />

      {/* Total in Words */}
      {invoice.inWords && (
        <div className="text-[9px] text-gray-600 mb-2">
          <span className="font-semibold">Amount in Words:</span>
          <p className="italic">{invoice.inWords}</p>
        </div>
      )}

      {/* Payment Details */}
      <div className="space-y-0.5 text-[10px] mb-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Payment:</span>
          <span className="font-medium">{invoice.paymentMethod || 'N/A'}</span>
        </div>
        {invoice.paymentRef && (
          <div className="flex justify-between">
            <span className="text-gray-500">Ref:</span>
            <span className="font-mono text-[9px]">{invoice.paymentRef}</span>
          </div>
        )}
        {invoice.changeDue > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Change Due:</span>
            <span className="font-medium">₹{formatIndianNumber(invoice.changeDue)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-300 my-1.5" />

      {/* QR Code */}
      <div className="flex justify-center my-2">
        <QRPlaceholder data={invoice.qrData || ''} />
      </div>

      <div className="border-t border-dashed border-gray-300 my-1.5" />

      {/* Footer */}
      <div className="text-center mt-2">
        <p className="font-bold text-sm">Thank you! Visit again :)</p>
        <p className="text-[10px] text-gray-500">धन्यवाद! फिर आइएगा :)</p>
        <p className="text-[9px] text-gray-400 mt-1">
          Bill generated by Ritam OS · {invoice.invoiceNo}
        </p>
        {!compact && invoice.qrData && (
          <p className="text-[8px] text-gray-300 mt-0.5 font-mono break-all">
            {invoice.qrData}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main InvoicePreview Component ───
export default function InvoicePreview({ invoice, onClose }) {
  const [printLoading, setPrintLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printed, setPrinted] = useState(false);
  const receiptRef = useRef(null);

  const { getDefaultPrinter } = usePrinterStore();

  /**
   * Handle printing via thermal printer
   */
  const handlePrint = useCallback(async () => {
    if (!invoice) return;

    setPrintLoading(true);
    try {
      // Use PrintEngine to generate ESC/POS bytes
      const engine = new PrintEngine();
      engine.generateReceipt(invoice, { showQR: true });

      const bytes = engine.getBuffer();

      // Try to send to thermal printer
      // In production, this would use WebUSB/Bluetooth/web socket
      console.log(`Generated ${bytes.length} bytes for printing`);
      
      // Simulate / attempt printing
      const result = await sendToPrinter(bytes);

      if (result) {
        setPrinted(true);
        toast.success('Receipt printed successfully');
      }
    } catch (error) {
      console.error('Print failed:', error);
      toast.error(`Print failed: ${error.message}`);
    } finally {
      setPrintLoading(false);
    }
  }, [invoice]);

  /**
   * Handle PDF download (placeholder)
   */
  const handleDownloadPDF = useCallback(async () => {
    setPdfLoading(true);
    try {
      // In production, use pdf-lib or jspdf to generate a PDF
      // For now, trigger a print of the receipt div
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoice.invoiceNo}</title>
              <style>
                @page { margin: 0.5in; }
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 10px;
                  width: 100%;
                  max-width: 80mm;
                  margin: 0 auto;
                  padding: 10px;
                }
                @media print {
                  body { max-width: none; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current?.innerHTML || ''}
              <script>
                window.print();
                window.close();
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success('PDF download started');
      } else {
        throw new Error('Popup blocked. Please allow popups to download PDF.');
      }
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error(`PDF failed: ${error.message}`);
    } finally {
      setPdfLoading(false);
    }
  }, [invoice]);

  /**
   * Share via WhatsApp (placeholder)
   */
  const handleShareWhatsApp = useCallback(() => {
    if (!invoice) return;

    const message = `🍽️ *${invoice.restaurant?.name || 'Ritam Restaurant'}*
📄 Invoice: ${invoice.invoiceNo}
📅 ${formatDate(invoice.date, invoice.time)}
💰 Total: ₹${formatIndianNumber(invoice.grandTotal)}
💳 ${invoice.paymentMethod || 'N/A'}

Thank you for dining with us! 🙏`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encoded}`;

    // Try native share first
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoiceNo}`,
        text: message,
      }).catch(() => {
        // Fallback to opening WhatsApp web
        window.open(url, '_blank');
      });
    } else {
      window.open(url, '_blank');
    }

    toast.success('WhatsApp share opened');
  }, [invoice]);

  if (!invoice) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[95vh] flex flex-col"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E]">Invoice Preview</h2>
            <p className="text-sm text-gray-500">
              {invoice.invoiceNo} · ₹{formatIndianNumber(invoice.grandTotal)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Receipt Preview ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-sm mx-auto">
            {/* Receipt Paper */}
            <div
              ref={receiptRef}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-200"
              style={{ fontFamily: "'Courier New', 'Courier', monospace" }}
            >
              <ReceiptContent invoice={invoice} />
            </div>

            {/* Print confirmation */}
            {printed && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg py-2">
                <Check size={16} />
                Receipt printed successfully
              </div>
            )}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="px-6 py-4 border-t border-gray-200 shrink-0">
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={printLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-semibold text-sm hover:bg-[#E85D04] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {printLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Printer size={18} />
              )}
              {printLoading ? 'Printing...' : printed ? 'Print Again' : 'Print Receipt'}
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              {pdfLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileDown size={18} />
              )}
              {pdfLoading ? 'Generating...' : 'Download PDF'}
            </button>

            {/* Share WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all shadow-sm"
            >
              <Share2 size={18} />
              Share WhatsApp
            </button>
          </div>

          {/* Keyboard shortcut hint */}
          <p className="text-center text-[10px] text-gray-400 mt-2">
            Press ESC to close · Thermal printer recommended for best results
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
