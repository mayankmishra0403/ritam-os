import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import useOrderStore from '../store/orderStore';
import { CATEGORIES, PRODUCTS, RESTAURANT_INFO } from '../data/mockData';
import ProductBottomSheet from '../components/ProductBottomSheet';
import CartPreviewSheet from '../components/CartPreviewSheet';

const gradientColors = [
  'from-orange-400 to-rose-500',
  'from-yellow-400 to-orange-500',
  'from-green-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-red-400 to-pink-500',
  'from-teal-400 to-cyan-500',
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/10"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('cat-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [addingItemId, setAddingItemId] = useState(null);

  const cart = useOrderStore((s) => s.cart);
  const addToCart = useOrderStore((s) => s.addToCart);
  const getCartCount = useOrderStore((s) => s.getCartCount);
  const getCartTotal = useOrderStore((s) => s.getCartTotal);
  const tableNumber = useOrderStore((s) => s.tableNumber);

  const categoryScrollRef = useRef(null);
  const searchInputRef = useRef(null);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  // Set default table number for demo
  useEffect(() => {
    const state = useOrderStore.getState();
    if (!state.tableNumber) {
      useOrderStore.getState().setTableInfo('table-3', 3, 'default');
    }
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let items = PRODUCTS;
    if (activeCategory !== 'cat-all') {
      items = items.filter((p) => p.categoryId === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameHi.includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

  // Group by category for display
  const groupedProducts = useMemo(() => {
    if (activeCategory !== 'cat-all') {
      // Show flat list for specific category
      return [{ category: CATEGORIES.find((c) => c.id === activeCategory), items: filteredProducts }];
    }
    // Group by category
    const groups = [];
    for (const cat of CATEGORIES) {
      if (cat.id === 'cat-all') continue;
      const items = PRODUCTS.filter((p) => p.categoryId === cat.id);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const filtered = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.nameHi.includes(q) ||
            p.description.toLowerCase().includes(q)
        );
        if (filtered.length > 0) {
          groups.push({ category: cat, items: filtered });
        }
      } else {
        groups.push({ category: cat, items });
      }
    }
    return groups;
  }, [activeCategory, filteredProducts, searchQuery]);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    setAddingItemId(product.id);
    addToCart(product);
    toast.success(`${product.name} added!`, {
      icon: '🍽️',
      style: { background: '#1A1A2E', color: '#fff' },
    });
    setTimeout(() => setAddingItemId(null), 600);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductSheet(true);
  };

  const openCartPreview = () => {
    if (cartCount > 0) {
      setShowCartPreview(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="ios-header px-4 pt-3 pb-3 safe-area-top">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {RESTAURANT_INFO.name}
              <span className="text-xs text-gray-400 font-normal">रितम</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} />
              <span>{RESTAURANT_INFO.tagline}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="badge-orange text-sm px-3 py-1.5">
              <MapPin size={13} />
              Table {tableNumber || 3}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search dishes... मेन्यू खोजें"
            className="input-field pl-10 pr-4 text-sm !rounded-xl !bg-white/80 !border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div
        ref={categoryScrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-3 hide-scrollbar sticky top-[104px] z-30 bg-background/90 backdrop-blur-md"
      >
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            className={`category-pill shrink-0 flex items-center gap-1.5 ${
              activeCategory === cat.id ? 'active' : ''
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4 relative">
            <FloatingParticles />
            <Search size={36} className="text-primary/60" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            {searchQuery ? 'No dishes found' : 'Hungry?'}
          </h3>
          <p className="text-sm text-gray-400 text-center">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : 'Order from the menu above!'}
          </p>
        </motion.div>
      )}

      {/* Product List */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeCategory === 'cat-all' && !searchQuery
            ? // Grouped by category
              groupedProducts.map((group) => (
                <motion.div
                  key={group.category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5"
                >
                  <div className="flex items-center gap-2 mb-3 mt-1">
                    <span className="text-lg">{group.category.icon}</span>
                    <h2 className="text-base font-bold text-gray-900">
                      {group.category.name}
                    </h2>
                    <span className="text-xs text-gray-400 font-normal">
                      {group.category.nameHi}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {group.items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={handleAddToCart}
                        onClick={handleProductClick}
                        isAdding={addingItemId === product.id}
                      />
                    ))}
                  </div>
                </motion.div>
              ))
            : // Flat list
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2.5"
                >
                  <ProductCard
                    product={product}
                    onAdd={handleAddToCart}
                    onClick={handleProductClick}
                    isAdding={addingItemId === product.id}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* Cart FAB */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button
            className="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={openCartPreview}
            aria-label={`View cart with ${cartCount} items`}
          >
            <ShoppingBag size={24} />
            <span className="fab-badge">{cartCount}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mini cart bar at bottom (alternative to FAB - shows on all) */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 safe-area-bottom"
          >
            <motion.button
              className="glass-card w-full flex items-center justify-between px-5 py-3.5 shadow-xl border-primary/20"
              whileTap={{ scale: 0.98 }}
              onClick={openCartPreview}
              style={{ borderColor: 'rgba(255,107,53,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </p>
                  <p className="text-xs text-gray-500">View cart</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">₹{cartTotal}</p>
                <p className="text-xs text-gray-400">+ GST</p>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Bottom Sheet */}
      <ProductBottomSheet
        isOpen={showProductSheet}
        onClose={() => setShowProductSheet(false)}
        product={selectedProduct}
      />

      {/* Cart Preview Sheet */}
      <CartPreviewSheet
        isOpen={showCartPreview}
        onClose={() => setShowCartPreview(false)}
      />
    </div>
  );
}

function ProductCard({ product, onAdd, onClick, isAdding }) {
  const gradientClass = gradientColors[product.id.charCodeAt(1) % gradientColors.length];
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className="product-card"
      layout
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(product)}
    >
      {/* Image Placeholder */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shrink-0 shadow-sm`}
      >
        <span className="text-xl sm:text-2xl text-white/80 drop-shadow-sm font-display font-bold">
          {product.name.charAt(0)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            {product.name}
          </h3>
          {product.popular && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-semibold shrink-0">
              Bestseller
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{product.nameHi}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
        </div>
      </div>

      {/* Add Button */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        {isAdding ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-9 h-9 rounded-full bg-success flex items-center justify-center"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </motion.svg>
          </motion.div>
        ) : (
          <motion.button
            className="w-9 h-9 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center"
            whileTap={{ scale: 0.85, backgroundColor: 'rgba(255,107,53,0.2)' }}
            onClick={(e) => onAdd(product, e)}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={18} className="text-primary" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
