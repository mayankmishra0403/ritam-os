import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  FolderPlus,
  UtensilsCrossed,
  Image,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mockCategories, mockProducts, mockModifiers } from '../data/mockData';

// ─── Category Form Modal ───
function CategoryModal({ onClose, editCategory }) {
  const [name, setName] = useState(editCategory?.name || '');
  const [nameHi, setNameHi] = useState(editCategory?.nameHi || '');
  const [sortOrder, setSortOrder] = useState(editCategory?.sortOrder || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    toast.success(editCategory ? 'Category updated' : 'Category created');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1A1A2E]">
            {editCategory ? 'Edit Category' : 'Add Category'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#FFF8F0]">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Name (English)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              placeholder="e.g., Starters"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Name (Hindi)</label>
            <input
              type="text"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              placeholder="e.g., स्टार्टर्स"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 w-24"
              min={1}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#F0E6DC] text-sm font-medium hover:bg-[#FFF8F0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#E85D04] transition-colors"
          >
            {editCategory ? 'Update' : 'Create'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

// ─── Product Form Modal ───
function ProductModal({ onClose, editProduct }) {
  const [name, setName] = useState(editProduct?.name || '');
  const [nameHi, setNameHi] = useState(editProduct?.nameHi || '');
  const [price, setPrice] = useState(editProduct?.price || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [category, setCategory] = useState(editProduct?.categoryId || mockCategories[0]?.id || '');
  const [active, setActive] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error('Name and price are required');
      return;
    }
    toast.success(editProduct ? 'Product updated' : 'Product created');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1A1A2E]">
            {editProduct ? 'Edit Product' : 'Add Product'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#FFF8F0]">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Name (English)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                placeholder="Product name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Name (Hindi)</label>
              <input
                type="text"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                placeholder="Hindi name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                placeholder="299"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 bg-white"
              >
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 resize-none"
              rows={2}
              placeholder="Product description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Image</label>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-[#F0E6DC] text-[#6B7280]">
              <Image size={24} />
              <span className="text-sm">Click to upload image (placeholder)</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF8F0]">
            <span className="text-sm font-medium text-[#1A1A2E]">Active</span>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`p-1 rounded-lg transition-colors ${active ? 'text-[#06D6A0]' : 'text-[#6B7280]'}`}
            >
              {active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#F0E6DC] text-sm font-medium hover:bg-[#FFF8F0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#E85D04] transition-colors"
          >
            {editProduct ? 'Update' : 'Create'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

// ─── Main MenuPage ───
export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState(mockCategories[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productStatus, setProductStatus] = useState({});

  const toggleProductStatus = (productId) => {
    setProductStatus((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
    toast.success('Product status updated');
  };

  const filteredProducts = useMemo(() => {
    let products = mockProducts;
    if (selectedCategory) {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameHi.includes(q)
      );
    }
    return products;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Menu Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {mockProducts.length} items across {mockCategories.length} categories
          </p>
        </div>
        <button
          onClick={() => setShowProductModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#E85D04] transition-all shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* ── Left: Categories ── */}
        <div className="w-72 shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium hover:bg-[#FF6B35]/20 transition-colors"
            >
              <FolderPlus size={14} />
              Add
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {mockCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'bg-white text-[#1A1A2E] hover:bg-[#FFF8F0] border border-[#F0E6DC]'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className={`text-xs ${selectedCategory === cat.id ? 'text-white/70' : 'text-[#6B7280]'}`}>
                    {cat.nameHi} · {mockProducts.filter((p) => p.categoryId === cat.id).length} items
                  </p>
                </div>
                {selectedCategory !== cat.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(cat);
                        setShowCategoryModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#F0E6DC] text-[#6B7280]"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success('Category deleted');
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Products ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F0E6DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-[#F0E6DC] p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">{product.name}</p>
                      <p className="text-xs text-[#6B7280]">{product.nameHi}</p>
                    </div>
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        productStatus[product.id] === false ? 'text-red-400' : 'text-[#06D6A0]'
                      }`}
                    >
                      {productStatus[product.id] === false ? (
                        <ToggleLeft size={20} />
                      ) : (
                        <ToggleRight size={20} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-3 line-clamp-1">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#FF6B35]">₹{product.price}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#FFF8F0] text-[#6B7280]"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => toast.success('Product deleted')}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
                <UtensilsCrossed size={48} className="mb-3 opacity-30" />
                <p className="font-medium">No products in this category</p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] text-sm font-medium hover:bg-[#FF6B35]/20 transition-colors"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCategoryModal && (
          <CategoryModal
            editCategory={editingCategory}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
          />
        )}
        {showProductModal && (
          <ProductModal
            editProduct={editingProduct}
            onClose={() => {
              setShowProductModal(false);
              setEditingProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
