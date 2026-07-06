import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowRight, X } from 'lucide-react';
import BottomSheet from './BottomSheet';
import useOrderStore from '../store/orderStore';

export default function CartPreviewSheet({ isOpen, onClose }) {
  const navigate = useNavigate();
  const cart = useOrderStore((s) => s.cart);
  const getCartTotal = useOrderStore((s) => s.getCartTotal);
  const getCartCount = useOrderStore((s) => s.getCartCount);

  const total = getCartTotal();
  const count = getCartCount();

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-gray-900">
            Your Cart ({count} {count === 1 ? 'item' : 'items'})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="tap-target flex items-center justify-center text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-2 mb-5 max-h-[40vh] overflow-y-auto">
        {cart.slice(0, 5).map((item, index) => (
          <motion.div
            key={item.id + index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-400">
                {item.nameHi} × {item.quantity}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-800 shrink-0">
              ₹{item.price * item.quantity}
            </span>
          </motion.div>
        ))}
        {cart.length > 5 && (
          <p className="text-xs text-center text-gray-400 pt-1">
            +{cart.length - 5} more items
          </p>
        )}
        {cart.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Your cart is empty</p>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mb-5 pt-2 border-t border-gray-200">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900">₹{total}</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <motion.button
          className="btn-primary w-full"
          whileTap={{ scale: 0.97 }}
          onClick={handleViewCart}
          disabled={cart.length === 0}
        >
          View Full Cart
          <ArrowRight size={18} />
        </motion.button>
        <motion.button
          className="btn-secondary w-full"
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
        >
          Continue Browsing
        </motion.button>
      </div>
    </BottomSheet>
  );
}
