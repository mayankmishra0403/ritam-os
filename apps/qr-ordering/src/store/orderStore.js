import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOrderStore = create(
  persist(
    (set, get) => ({
      // Table info (set from URL params or QR code)
      tableId: null,
      tableNumber: null,
      outletId: 'default',

      // Cart
      cart: [],

      // Customer info
      customerName: '',
      customerPhone: '',

      setTableInfo: (tableId, tableNumber, outletId) =>
        set({ tableId, tableNumber, outletId }),

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),

      updateQuantity: (productId, delta) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId
              ? { ...item, quantity: Math.max(1, item.quantity + delta) }
              : item
          ),
        })),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      clearCart: () => set({ cart: [] }),

      setCustomerInfo: (name, phone) =>
        set({ customerName: name, customerPhone: phone }),

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: 'ritam-cart' }
  )
);

export default useOrderStore;
