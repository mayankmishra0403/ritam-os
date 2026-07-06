import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { ordersApi } from '../services/api';

const STATUS_TABS = ['active', 'completed'] as const;
const STATUS_TAB_LABELS: Record<string, { hi: string; en: string }> = {
  active: { hi: 'सक्रिय', en: 'Active' },
  completed: { hi: 'पूर्ण', en: 'Completed' },
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFD166',
  preparing: '#FF6B35',
  served: '#06D6A0',
  completed: '#118AB2',
  cancelled: '#EF476F',
};

const STATUS_LABELS: Record<string, { hi: string; en: string }> = {
  pending: { hi: 'लंबित', en: 'Pending' },
  preparing: { hi: 'तैयार हो रहा', en: 'Preparing' },
  served: { hi: 'परोसा गया', en: 'Served' },
  completed: { hi: 'पूर्ण', en: 'Completed' },
  cancelled: { hi: 'रद्द', en: 'Cancelled' },
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = activeTab === 'active' ? { status: ['pending', 'preparing', 'served'] } : { status: ['completed', 'cancelled'] };
      const res = await ordersApi.list('default', params);
      setOrders(res.data.data || res.data || []);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load orders' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => setSelectedOrder(selectedOrder?._id === item._id ? null : item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderNumber}>#{item.orderNumber || item._id?.slice(-6)}</Text>
          <Text style={styles.tableLabel}>टेबल / Table: {item.tableNumber}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[item.status] || COLORS.textLight }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]?.hi || item.status}</Text>
        </View>
      </View>

      <Text style={styles.timeText}>
        {new Date(item.createdAt).toLocaleTimeString('hi-IN')}
      </Text>

      <Text style={styles.itemsLabel}>आइटम / Items:</Text>
      {(item.items || []).slice(0, 5).map((it: any, idx: number) => (
        <Text key={idx} style={styles.itemRow}>
          {it.name} × {it.quantity} - ₹{it.price * it.quantity}
        </Text>
      ))}
      {(item.items || []).length > 5 && (
        <Text style={styles.moreText}>+{item.items.length - 5} और / more</Text>
      )}

      {selectedOrder?._id === item._id && (
        <View style={styles.orderDetail}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>उप-योग / Subtotal:</Text>
            <Text style={styles.detailValue}>₹{item.subtotal || 0}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>कर / Tax:</Text>
            <Text style={styles.detailValue}>₹{item.tax || 0}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailTotal]}>
            <Text style={styles.detailTotalLabel}>कुल / Total:</Text>
            <Text style={styles.detailTotalValue}>₹{item.total || 0}</Text>
          </View>
          {item.payment && (
            <Text style={styles.paymentText}>
              भुगतान / Payment: {item.payment.method} - ₹{item.payment.amount}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ऑर्डर</Text>
        <Text style={styles.titleEn}>Orders</Text>
      </View>

      <View style={styles.tabRow}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {STATUS_TAB_LABELS[tab].hi}
            </Text>
            <Text style={[styles.tabTextEn, activeTab === tab && styles.activeTabText]}>
              {STATUS_TAB_LABELS[tab].en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>कोई ऑर्डर नहीं</Text>
            <Text style={styles.emptyTextEn}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.dark,
  },
  titleEn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minHeight: TOUCH_TARGET.min,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabTextEn: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.white,
  },
  list: {
    paddingHorizontal: SPACING.lg,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.dark,
  },
  tableLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  itemsLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemRow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
    marginBottom: 2,
  },
  moreText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginLeft: SPACING.md,
  },
  orderDetail: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  detailTotalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.dark,
  },
  detailTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.primary,
  },
  paymentText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  emptyTextEn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
});
