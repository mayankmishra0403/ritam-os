import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { menuApi, ordersApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import CartItem from '../components/CartItem';
import PaymentModal from '../components/PaymentModal';

const TAX_RATE = 0.05;

export default function BillingScreen({ route, navigation }: any) {
  const { tableId, tableNumber, orderId: existingOrderId } = route.params || {};

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Map<string, any>>(new Map());
  const [orderId, setOrderId] = useState<string | null>(existingOrderId || null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const [catRes, menuRes] = await Promise.all([
        menuApi.categories('default'),
        menuApi.list('default'),
      ]);
      setCategories(catRes.data.data || catRes.data || []);
      setProducts(menuRes.data.data || menuRes.data || []);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load menu' });
    } finally {
      setLoadingMenu(false);
    }
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameHindi?.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const next = new Map(prev);
      const key = product._id || product.id;
      if (next.has(key)) {
        next.set(key, { ...next.get(key), quantity: next.get(key).quantity + 1 });
      } else {
        next.set(key, { ...product, quantity: 1 });
      }
      return next;
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const item = next.get(key);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        next.delete(key);
      } else {
        next.set(key, { ...item, quantity: newQty });
      }
      return next;
    });
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const cartItems = Array.from(cart.entries());
  const subtotal = cartItems.reduce((sum, [, item]) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Cart is empty' });
      return;
    }
    try {
      const items = cartItems.map(([, item]) => ({
        menuItemId: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));
      const res = await ordersApi.create({
        tableId,
        tableNumber,
        items,
        subtotal,
        tax,
        total,
      });
      setOrderId(res.data.data?._id || res.data._id);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Order created!' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create order' });
    }
  };

  const handlePayment = async (method: 'cash' | 'upi' | 'card') => {
    if (!orderId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Create order first' });
      return;
    }
    setProcessingPayment(true);
    try {
      await ordersApi.addPayment(orderId, { method, amount: total });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Payment complete!' });
      setPaymentModalVisible(false);
      setCart(new Map());
      setOrderId(null);
      navigation.goBack();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Payment failed' });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loadingMenu) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Left Panel - Menu */}
      <View style={styles.menuPanel}>
        <View style={styles.menuHeader}>
          <Text style={styles.panelTitle}>मेनू</Text>
          <Text style={styles.panelTitleEn}>Menu</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="खोजें / Search..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'all' && styles.activeCategoryChip]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[styles.categoryText, activeCategory === 'all' && styles.activeCategoryText]}>
              सभी / All
            </Text>
          </TouchableOpacity>
          {categories.map((cat: any) => (
            <TouchableOpacity
              key={cat._id || cat.id || cat.name}
              style={[styles.categoryChip, activeCategory === (cat._id || cat.name) && styles.activeCategoryChip]}
              onPress={() => setActiveCategory(cat._id || cat.name)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === (cat._id || cat.name) && styles.activeCategoryText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductCard
              name={item.name}
              nameHindi={item.nameHindi}
              price={item.price}
              onAdd={() => addToCart(item)}
            />
          )}
          keyExtractor={(item) => item._id || item.id || item.name}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Right Panel - Cart */}
      <View style={styles.cartPanel}>
        <View style={styles.cartHeader}>
          <Text style={styles.panelTitle}>टेबल {tableNumber}</Text>
          <Text style={styles.panelTitleEn}>Table {tableNumber}</Text>
          {orderId && (
            <Text style={styles.orderIdText}>Order: {orderId.slice(-6)}</Text>
          )}
        </View>

        <ScrollView style={styles.cartList}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyText}>कार्ट खाली है</Text>
              <Text style={styles.emptyTextEn}>Cart is empty</Text>
            </View>
          ) : (
            cartItems.map(([key, item]) => (
              <CartItem
                key={key}
                name={item.name}
                nameHindi={item.nameHindi}
                quantity={item.quantity}
                price={item.price}
                onIncrement={() => updateQuantity(key, 1)}
                onDecrement={() => updateQuantity(key, -1)}
                onRemove={() => removeFromCart(key)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>उप-योग / Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>कर (5%) / Tax</Text>
            <Text style={styles.summaryValue}>₹{tax}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>कुल / Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.kotButton]}
            onPress={handleCreateOrder}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>🖨 KOT प्रिंट / Print KOT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.billButton]}
            onPress={() => {
              if (!orderId) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'Create order first' });
                return;
              }
              setPaymentModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>🧾 बिल / Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.paymentButton]}
            onPress={() => {
              if (!orderId) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'Create order first' });
                return;
              }
              setPaymentModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>💳 भुगतान / Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PaymentModal
        visible={paymentModalVisible}
        total={total}
        onClose={() => setPaymentModalVisible(false)}
        onPayment={handlePayment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Menu Panel (left)
  menuPanel: {
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  menuHeader: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.dark,
  },
  panelTitleEn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: TOUCH_TARGET.min,
  },
  categoryRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    minHeight: TOUCH_TARGET.min,
    justifyContent: 'center',
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeCategoryText: {
    color: COLORS.white,
  },
  productList: {
    padding: SPACING.sm,
  },
  // Cart Panel (right)
  cartPanel: {
    flex: 2,
    backgroundColor: COLORS.white,
  },
  cartHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderIdText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  cartList: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  emptyTextEn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  summary: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  totalLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET.preferred,
  },
  kotButton: {
    backgroundColor: COLORS.dark,
  },
  billButton: {
    backgroundColor: COLORS.secondary,
  },
  paymentButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
});
