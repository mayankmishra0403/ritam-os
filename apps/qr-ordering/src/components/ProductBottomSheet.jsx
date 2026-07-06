import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import BottomSheet from './BottomSheet';
import useOrderStore from '../store/orderStore';

const gradientColors = [
  'from-orange-400 to-rose-500',
  'from-yellow-400 to-orange-500',
  'from-green-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-red-400 to-pink-500',
];

export default function ProductBottomSheet({ isOpen, onClose, product }) {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const cart = useOrderStore((s) => s.cart);
  const addToCart = useOrderStore((s) => s.addToCart);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setInstructions('');

      // If already in cart, pre-fill quantity
      const existing = cart.find((item) => item.id === product.id);
      if (existing) {
        setQuantity(existing.quantity);
        if (existing.specialInstructions) {
          setInstructions(existing.specialInstructions);
        }
      }
    }
  }, [product, cart]);

  if (!product) return null;

  const gradientClass = gradientColors[product.id.charCodeAt(1) % gradientColors.length];
  const existingItem = cart.find((item) => item.id === product.id);

  const handleAddToCart = () => {
    // Build the full cart item
    const cartItem = {
      ...product,
      quantity,
      specialInstructions: instructions,
    };

    // Directly update cart: remove existing entry for this product, then add new one
    const state = useOrderStore.getState();
    const filteredCart = state.cart.filter((item) => item.id !== product.id);
    useOrderStore.setState({
      cart: [...filteredCart, cartItem],
    });

    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Product Image Placeholder */}
      <div className="flex justify-center mb-4">
        <div
          className={`w-40 h-40 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}
        >
          <span className="text-5xl text-white/90 drop-shadow-md">
            {product.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Product Name */}
      <h2 className="text-2xl font-bold text-gray-900 text-center">
        {product.name}
      </h2>
      <p className="text-base text-gray-500 text-center mb-1">
        {product.nameHi}
      </p>

      {/* Quick-add from card buttons shouldn't navigate to this — so show description */}
      <p className="text-sm text-gray-600 text-center leading-relaxed mb-4">
        {product.description}
      </p>
      <p className="text-sm text-gray-400 text-center mb-4">
        {product.descriptionHi}
      </p>

      {/* Price */}
      <div className="text-center mb-6">
        <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
        <span className="text-sm text-gray-500 ml-1">+ GST</span>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <motion.button
          className="qty-btn"
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </motion.button>
        <motion.span
          key={quantity}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-bold w-8 text-center"
        >
          {quantity}
        </motion.span>
        <motion.button
          className="qty-btn"
          whileTap={{ scale: 0.9 }}
          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      {/* Special Instructions */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Special Instructions / खास निर्देश
        </label>
        <textarea
          className="textarea-field"
          placeholder="E.g., less spicy, extra cheese..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
        />
      </div>

      {/* Add/Update to Cart Button */}
      <motion.button
        className="btn-primary w-full text-base"
        whileTap={{ scale: 0.97 }}
        onClick={handleAddToCart}
      >
        <ShoppingCart size={18} />
        {existingItem ? 'Update' : 'Add to Cart'} — ₹{product.price * quantity}
      </motion.button>
    </BottomSheet>
  );
}
