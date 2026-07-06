import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  ScrollText,
  ChevronLeft,
  IndianRupee,
  Percent,
  X,
  Check,
  Smartphone,
  Wallet,
  CreditCard,
  QrCode,
  SplitSquareHorizontal,
  FileText,
  MessageSquare,
  ArrowLeft,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mockCategories, mockProducts, mockModifiers, mockTables } from '../data/mockData';
import usePosStore from '../store/posStore';

// ─── Payment Modal ───
function PaymentModal({ onClose }) {
  const {
    getGrandTotal,
    getSubtotal,
    getTaxTotal,
    getDiscountAmount,
    cart,
    customerName,
    selectedTable,
    paymentMethod,
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    upiPaymentConfirmed,
    setUpiPaymentConfirmed,
    clearCart,
    setSelectedTable,
  } = usePosStore();

  const navigate = useNavigate();
  const grandTotal = getGrandTotal();
  const subtotal = getSubtotal();
  const tax = getTaxTotal(subtotal);
  const discountAmt = getDiscountAmount(subtotal);
  const change = Math.max(0, cashTendered - grandTotal);

  const handleComplete = () => {
    toast.success(`Order completed for Table ${selectedTable?.tableNumber || 'Takeaway'}`);
    clearCart();
    setSelectedTable(null);
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#F0E6DC]">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E]">Collect Payment</h2>
            <p className="text-sm text-[#6B7280]">
              Table {selectedTable?.tableNumber} · {customerName || 'Walk-in'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#FFF8F0] text-[#6B7280]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="px-6 py-4 bg-[#FFF8F0] border-b border-[#F0E6DC]">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[#6B7280]">Total Amount</span>
            <span className="text-3xl font-bold text-[#1A1A2E]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-[#6B7280]">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (10%)</span>
              <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-[#06D6A0]">
                <span>Discount</span>
                <span>-₹{discountAmt.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-medium text-[#6B7280]">Select Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { method: 'CASH', icon: Wallet, label: 'Cash' },
              { method: 'UPI', icon: Smartphone, label: 'UPI' },
              { method: 'CARD', icon: CreditCard, label: 'Card' },
              { method: 'SPLIT', icon: SplitSquareHorizontal, label: 'Split' },
            ].map(({ method, icon: Icon, label }) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === method
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                    : 'border-[#F0E6DC] hover:border-[#FF6B35]/30'
                }`}
              >
                <Icon
                  size={24}
                  className={
                    paymentMethod === method ? 'text-[#FF6B35]' : 'text-[#6B7280]'
                  }
                />
                <span
                  className={`font-medium ${
                    paymentMethod === method ? 'text-[#FF6B35]' : 'text-[#1A1A2E]'
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Cash Payment */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 mt-4 p-4 bg-[#FFF8F0] rounded-xl">
              <label className="text-sm font-medium text-[#1A1A2E]">
                Amount Tendered
              </label>
              <div className="relative">
                <IndianRupee
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                />
                <input
                  type="number"
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F0E6DC] bg-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                  autoFocus
                />
              </div>
              {cashTendered >= grandTotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#06D6A0] font-medium">Change Due</span>
                  <span className="text-lg font-bold text-[#06D6A0]">
                    ₹{change.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* UPI Payment */}
          {paymentMethod === 'UPI' && (
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-[#FFF8F0] rounded-xl flex items-center justify-center border-2 border-dashed border-[#F0E6DC]">
                  <div className="text-center">
                    <QrCode size={64} className="text-[#FF6B35] mx-auto mb-2" />
                    <p className="text-xs text-[#6B7280]">QR Code Placeholder</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#6B7280]">UPI ID:</p>
                <p className="text-sm font-mono font-medium">ritam@paytm</p>
              </div>
              <button
                onClick={() => {
                  setUpiPaymentConfirmed(true);
                  toast.success('UPI payment confirmed');
                }}
                disabled={upiPaymentConfirmed}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  upiPaymentConfirmed
                    ? 'bg-[#06D6A0]/20 text-[#06D6A0]'
                    : 'bg-[#FF6B35] text-white hover:bg-[#E85D04]'
                }`}
              >
                {upiPaymentConfirmed ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check size={18} /> Payment Confirmed
                  </span>
                ) : (
                  'Confirm UPI Payment'
                )}
              </button>
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === 'CARD' && (
            <div className="mt-4 p-6 text-center bg-[#FFF8F0] rounded-xl">
              <CreditCard size={48} className="mx-auto mb-3 text-[#FF6B35]" />
              <p className="text-sm text-[#6B7280]">
                Swipe / Tap card on the terminal
              </p>
              <button className="mt-4 w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#E85D04] transition-all">
                Simulate Card Payment
              </button>
            </div>
          )}

          {/* Split Payment */}
          {paymentMethod === 'SPLIT' && (
            <div className="mt-4 p-4 bg-[#FFF8F0] rounded-xl">
              <p className="text-sm text-[#6B7280] mb-3">
                Split total of ₹{grandTotal.toLocaleString('en-IN')} equally?
              </p>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className="flex-1 py-2 rounded-lg border border-[#F0E6DC] text-sm font-medium hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                  >
                    {num} ways
                    <br />
                    <span className="text-xs text-[#6B7280]">
                      ₹{(grandTotal / num).toFixed(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Complete Order Button */}
          <button
            onClick={handleComplete}
            disabled={
              (paymentMethod === 'CASH' && cashTendered < grandTotal) ||
              (paymentMethod === 'UPI' && !upiPaymentConfirmed)
            }
            className="w-full py-4 rounded-xl bg-[#06D6A0] text-white font-bold text-lg hover:bg-[#05C090] disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2"
          >
            Complete Order
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main BillingPage ───
export default function BillingPage() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const {
    cart,
    selectedTable,
    customerName,
    setCustomerName,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    notes,
    setNotes,
    addToCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getGrandTotal,
    paymentModalOpen,
    setPaymentModalOpen,
    menuSearch,
    setMenuSearch,
    selectedCategory,
    setSelectedCategory,
  } = usePosStore();

  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showModifierModal, setShowModifierModal] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  // Set table from URL param if exists
  useEffect(() => {
    if (tableId) {
      const table = mockTables.find((t) => t.tableNumber === parseInt(tableId));
      if (table) {
        usePosStore.getState().setSelectedTable(table);
      }
    }
  }, [tableId]);

  const subtotal = getSubtotal();
  const grandTotal = getGrandTotal();
  const tax = subtotal * 0.1;
  const cgst = subtotal * 0.05;
  const sgst = subtotal * 0.05;

  const getDiscountAmount = () => {
    if (discountType === 'percentage') return subtotal * (discount / 100);
    return discount;
  };
  const discountAmount = getDiscountAmount();

  // Filter products
  const filteredProducts = useMemo(() => {
    let products = mockProducts;
    if (selectedCategory) {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameHi.includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return products;
  }, [selectedCategory, menuSearch]);

  const handleAddToCart = (product) => {
    const modifiersForProduct = mockModifiers.filter(
      (m) => selectedModifiers.includes(m.id)
    );
    addToCart(product, modifiersForProduct);
    setSelectedModifiers([]);
    toast.success(`${product.name} added`);
  };

  const handleProductLongPress = (product) => {
    setShowModifierModal(product);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Back button for mobile/tablet */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-[#F0E6DC] shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT: Menu Grid ── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-[#F0E6DC]">
          {/* Search Bar */}
          <div className="px-4 py-3 bg-white border-b border-[#F0E6DC]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F0E6DC] bg-[#FFF8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 py-3 bg-white border-b border-[#F0E6DC] overflow-x-auto hide-scrollbar">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'bg-[#FFF8F0] text-[#6B7280] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35]'
                }`}
              >
                All Items
              </button>
              {mockCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#FF6B35] text-white shadow-sm'
                      : 'bg-[#FFF8F0] text-[#6B7280] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleAddToCart(product)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleProductLongPress(product);
                  }}
                  className="flex flex-col bg-white rounded-xl border border-[#F0E6DC] overflow-hidden hover:shadow-md hover:border-[#FF6B35]/30 transition-all active:scale-[0.97] text-left"
                >
                  {/* Image placeholder */}
                  <div className="h-20 bg-gradient-to-br from-[#FF6B35] to-[#E85D04] flex items-center justify-center">
                    <UtensilsCrossed size={24} className="text-white/60" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-sm font-semibold text-[#1A1A2E] leading-tight">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{product.nameHi}</p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-base font-bold text-[#FF6B35]">
                        ₹{product.price}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#FF6B35] text-white flex items-center justify-center">
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
                <Search size={40} className="mb-3 opacity-40" />
                <p className="font-medium">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div className="w-[380px] xl:w-[420px] flex flex-col bg-white shrink-0">
          {/* Order Header */}
          <div className="px-4 py-3 border-b border-[#F0E6DC] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#1A1A2E]">
                Table {selectedTable?.tableNumber || '—'}
              </span>
              <span className="text-xs text-[#6B7280]">
                {cart.length} items
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <User size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#F0E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                />
              </div>
              <span className="text-sm text-[#6B7280] py-1.5">Waiter: Rajesh</span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-[#FFF8F0] rounded-xl p-3 border border-[#F0E6DC]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">{item.nameHi}</p>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.modifiers.map((mod) => (
                            <span
                              key={mod.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[10px] font-medium text-[#FF6B35]"
                            >
                              +{mod.name}
                              {mod.price > 0 && ` ₹${mod.price}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-lg border border-[#F0E6DC] flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center hover:bg-[#E85D04] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[#1A1A2E]">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-[#6B7280]">
                <UtensilsCrossed size={48} className="mb-3 opacity-30" />
                <p className="font-medium">Cart is empty</p>
                <p className="text-sm">Tap items to add to order</p>
              </div>
            )}
          </div>

          {/* Notes & Discount */}
          <div className="px-4 py-2 border-t border-[#F0E6DC] space-y-2">
            {/* Note */}
            <div>
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
              >
                <MessageSquare size={16} />
                {notes ? 'Edit Note' : 'Add Note'}
              </button>
              <AnimatePresence>
                {showNoteInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Order notes..."
                      className="w-full mt-2 p-2 rounded-lg border border-[#F0E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 resize-none"
                      rows={2}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Discount */}
            <div>
              <button
                onClick={() => setShowDiscountInput(!showDiscountInput)}
                className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
              >
                <Percent size={16} />
                {discount > 0 ? `Discount: ${discount}${discountType === 'percentage' ? '%' : '₹'}` : 'Apply Discount'}
              </button>
              <AnimatePresence>
                {showDiscountInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 mt-2">
                      <div className="flex gap-1 bg-[#FFF8F0] rounded-lg p-1">
                        <button
                          onClick={() => setDiscountType('percentage')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            discountType === 'percentage'
                              ? 'bg-white shadow-sm text-[#1A1A2E]'
                              : 'text-[#6B7280]'
                          }`}
                        >
                          %
                        </button>
                        <button
                          onClick={() => setDiscountType('fixed')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            discountType === 'fixed'
                              ? 'bg-white shadow-sm text-[#1A1A2E]'
                              : 'text-[#6B7280]'
                          }`}
                        >
                          ₹
                        </button>
                      </div>
                      <input
                        type="number"
                        value={discount || ''}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        placeholder="0"
                        className="w-20 px-3 py-1.5 rounded-lg border border-[#F0E6DC] text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-4 py-3 border-t border-[#F0E6DC] space-y-1.5 bg-[#FFF8F0]">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">CGST (5%)</span>
              <span className="font-medium">₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">SGST (5%)</span>
              <span className="font-medium">₹{sgst.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#06D6A0]">Discount</span>
                <span className="font-medium text-[#06D6A0]">
                  -₹{discountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-[#F0E6DC]">
              <span className="text-[#1A1A2E]">Grand Total</span>
              <span className="text-[#FF6B35]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 border-t border-[#F0E6DC] space-y-2">
            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#F0E6DC] text-sm font-medium text-[#6B7280] hover:bg-[#FFF8F0] transition-colors"
              >
                <ScrollText size={16} />
                Print KOT
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#F0E6DC] text-sm font-medium text-[#6B7280] hover:bg-[#FFF8F0] transition-colors"
              >
                <FileText size={16} />
                Generate Bill
              </button>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              disabled={cart.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#06D6A0] text-white font-bold text-base hover:bg-[#05C090] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <IndianRupee size={20} />
              Collect Payment — ₹{grandTotal.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModalOpen && (
          <PaymentModal onClose={() => setPaymentModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Modifier Modal */}
      <AnimatePresence>
        {showModifierModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => {
              setShowModifierModal(null);
              setSelectedModifiers([]);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-1">
                {showModifierModal.name}
              </h3>
              <p className="text-sm text-[#6B7280] mb-4">Select customizations</p>
              <div className="space-y-2">
                {mockModifiers.map((mod) => (
                  <label
                    key={mod.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedModifiers.includes(mod.id)
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-[#F0E6DC] hover:border-[#FF6B35]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedModifiers.includes(mod.id)}
                        onChange={() => {
                          setSelectedModifiers((prev) =>
                            prev.includes(mod.id)
                              ? prev.filter((id) => id !== mod.id)
                              : [...prev, mod.id]
                          );
                        }}
                        className="w-5 h-5 rounded accent-[#FF6B35]"
                      />
                      <span className="text-sm font-medium">{mod.name}</span>
                    </div>
                    {mod.price > 0 && (
                      <span className="text-sm text-[#6B7280]">+₹{mod.price}</span>
                    )}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowModifierModal(null);
                    setSelectedModifiers([]);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#F0E6DC] text-sm font-medium hover:bg-[#FFF8F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(showModifierModal);
                    setShowModifierModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#E85D04] transition-colors"
                >
                  Add to Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
