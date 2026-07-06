import { create } from 'zustand';

const usePosStore = create((set) => ({
  // Cart
  cart: [],
  selectedTable: null,
  customerName: '',
  customerPhone: '',
  discount: 0,
  discountType: 'percentage', // 'percentage' | 'fixed'
  notes: '',

  // Table filter
  tableFilter: 'ALL', // 'ALL' | 'FREE' | 'OCCUPIED' | 'RESERVED' | 'BILLING'
  sectionFilter: 'ALL',

  // Menu search
  menuSearch: '',
  selectedCategory: null,

  // Payment
  paymentModalOpen: false,
  paymentMethod: null,
  cashTendered: 0,
  upiQrLoaded: false,
  upiPaymentConfirmed: false,

  // Add item to cart
  addToCart: (product, modifiers = []) =>
    set((state) => {
      const modifierTotal = modifiers.reduce((sum, m) => sum + Number(m.price), 0);
      const unitPrice = Number(product.price) + modifierTotal;

      // Check if same product + same modifiers combo exists
      const modifierIds = modifiers.map((m) => m.id).sort().join(',');
      const existing = state.cart.find(
        (item) =>
          item.productId === product.id &&
          item.modifierIds === modifierIds
      );

      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        cart: [
          ...state.cart,
          {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            nameHi: product.nameHi || '',
            unitPrice,
            basePrice: Number(product.price),
            quantity: 1,
            modifiers,
            modifierIds,
            notes: '',
          },
        ],
      };
    }),

  updateQuantity: (itemId, delta) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  removeItem: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    })),

  clearCart: () =>
    set({
      cart: [],
      discount: 0,
      discountType: 'percentage',
      customerName: '',
      customerPhone: '',
      notes: '',
      paymentModalOpen: false,
      paymentMethod: null,
      cashTendered: 0,
    }),

  setSelectedTable: (table) => set({ selectedTable: table }),
  setCustomerName: (name) => set({ customerName: name }),
  setCustomerPhone: (phone) => set({ customerPhone: phone }),
  setDiscount: (discount) => set({ discount }),
  setDiscountType: (type) => set({ discountType: type }),
  setNotes: (notes) => set({ notes: notes }),
  setTableFilter: (filter) => set({ tableFilter: filter }),
  setSectionFilter: (section) => set({ sectionFilter: section }),
  setMenuSearch: (search) => set({ menuSearch: search }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setPaymentModalOpen: (open) => set({ paymentModalOpen: open }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCashTendered: (amount) => set({ cashTendered: amount }),
  setUpiQrLoaded: (loaded) => set({ upiQrLoaded: loaded }),
  setUpiPaymentConfirmed: (confirmed) => set({ upiPaymentConfirmed: confirmed }),

  // Computed helpers
  getSubtotal: () => {
    const state = usePosStore.getState();
    return state.cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  },

  getTaxTotal: (subtotal) => subtotal * 0.1,

  getDiscountAmount: (subtotal) => {
    const state = usePosStore.getState();
    if (state.discountType === 'percentage') {
      return subtotal * (state.discount / 100);
    }
    return state.discount;
  },

  getGrandTotal: () => {
    const state = usePosStore.getState();
    const subtotal = state.cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    let discountAmt = 0;
    if (state.discountType === 'percentage') {
      discountAmt = subtotal * (state.discount / 100);
    } else {
      discountAmt = state.discount;
    }
    return Math.max(0, subtotal + tax - discountAmt);
  },

  // Get category-wise item count
  getItemCount: () => {
    const state = usePosStore.getState();
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

export default usePosStore;
