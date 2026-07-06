import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  User,
  Phone,
  Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useOrderStore from '../store/orderStore';

const TAX_RATE = 0.10; // GST 10%

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.15 } },
};

export default function CartPage() {
  const navigate = useNavigate();
  const cart = useOrderStore((s) => s.cart);
  const updateQuantity = useOrderStore((s) => s.updateQuantity);
  const removeFromCart = useOrderStore((s) => s.removeFromCart);
  const clearCart = useOrderStore((s) => s.clearCart);
  const getCartTotal = useOrderStore((s) => s.getCartTotal);
  const tableNumber = useOrderStore((s) => s.tableNumber);
  const customerName = useOrderStore((s) => s.customerName);
  const customerPhone = useOrderStore((s) => s.customerPhone);
  const setCustomerInfo = useOrderStore((s) => s.setCustomerInfo);

  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);
  const [isPlacing, setIsPlacing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * TAX_RATE);
  const grandTotal = subtotal + tax;

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsPlacing(true);
    setCustomerInfo(name.trim(), phone.trim());

    // Simulate order placement
    setTimeout(() => {
      setIsPlacing(false);
      const orderId = Math.floor(100 + Math.random() * 900);
      navigate(`/order/${orderId}`);
    }, 1500);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
    setConfirmClear(false);
  };

  if (cart.length === 0) {
    return (
      <motion.div
        className="min-h-screen bg-background flex flex-col"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <div className="ios-header px-4 pt-3 pb-3 safe-area-top flex items-center gap-3">
          <motion.button
            className="tap-target flex items-center justify-center -ml-2"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">Your Order</h1>
          <div className="badge-orange ml-auto">
            <ShoppingBag size={12} />
            Table {tableNumber || 3}
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.2 }}
            className="w-28 h-28 rounded-full bg-orange-50 flex items-center justify-center mb-6"
          >
            <ShoppingBag size={48} className="text-primary/40" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-400 text-center mb-8">
            Browse the menu and add items to get started.
          </p>
          <motion.button
            className="btn-primary px-10"
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
          >
            Browse Menu
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="ios-header px-4 pt-3 pb-3 safe-area-top">
        <div className="flex items-center gap-3">
          <motion.button
            className="tap-target flex items-center justify-center -ml-2"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">Your Order</h1>
          <div className="badge-orange ml-auto">
            <ShoppingBag size={12} />
            Table {tableNumber || 3}
          </div>
          <motion.button
            className="text-xs text-danger font-semibold px-3 py-1.5 rounded-full bg-red-50"
            whileTap={{ scale: 0.95 }}
            onClick={() => setConfirmClear(true)}
          >
            Clear
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-40">
        {/* Cart Items */}
        <div className="space-y-2.5 mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Items ({cart.length})
          </h2>
          <AnimatePresence>
            {cart.map((item, index) => (
              <CartItemCard
                key={item.id + index}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Customer Details
          </h2>
          <div className="space-y-3">
            <div className="relative">
              <User
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Your name (optional)"
                className="input-field pl-10 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="relative">
              <Phone
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                placeholder="Phone number (for order updates)"
                className="input-field pl-10 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                required
              />
            </div>
            {phone.length > 0 && phone.length < 10 && (
              <p className="text-xs text-danger">Please enter a valid 10-digit number</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Bill Details
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({cart.length} items)</span>
              <span className="text-gray-900 font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (10%)</span>
              <span className="text-gray-900 font-medium">₹{tax}</span>
            </div>
            <div className="border-t border-gray-100 pt-2.5 mt-2">
              <div className="flex justify-between">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-xl font-bold text-primary">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <motion.button
          className="btn-primary w-full text-base py-4 shadow-lg shadow-primary/25"
          whileTap={{ scale: 0.97 }}
          onClick={handlePlaceOrder}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Placing Order...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Receipt size={20} />
              Place Order — ₹{grandTotal}
            </span>
          )}
        </motion.button>
      </div>

      {/* Clear Cart Confirmation */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6"
            onClick={() => setConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-danger" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                Clear Cart?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                This will remove all items from your cart.
              </p>
              <div className="flex gap-3">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary flex-1 !bg-danger !bg-gradient-none"
                  onClick={handleClearCart}
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CartItemCard({ item, onUpdateQuantity, onRemove }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white rounded-xl p-3.5 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-center gap-3">
        {/* Item info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
          </div>
          <p className="text-xs text-gray-400">{item.nameHi}</p>
          <p className="text-xs text-gray-500 mt-0.5">₹{item.price} each</p>

          {/* Special Instructions */}
          {item.specialInstructions && (
            <div className="mt-1.5 bg-orange-50 rounded-lg px-2.5 py-1.5">
              <p className="text-xs text-orange-700 italic">
                "{item.specialInstructions}"
              </p>
            </div>
          )}
        </div>

        {/* Quantity Controls & Total */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <motion.button
              className="qty-btn !w-7 !h-7"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (item.quantity <= 1) {
                  setShowDelete(true);
                  setTimeout(() => {
                    onRemove(item.id);
                    setShowDelete(false);
                  }, 300);
                } else {
                  onUpdateQuantity(item.id, -1);
                }
              }}
            >
              <Minus size={13} />
            </motion.button>
            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
            <motion.button
              className="qty-btn !w-7 !h-7"
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateQuantity(item.id, 1)}
            >
              <Plus size={13} />
            </motion.button>
          </div>
          <span className="text-sm font-bold text-gray-900 w-16 text-right">
            ₹{item.price * item.quantity}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <motion.button
        className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(item.id)}
      >
        <Trash2 size={13} className="text-danger" />
      </motion.button>
    </motion.div>
  );
}
