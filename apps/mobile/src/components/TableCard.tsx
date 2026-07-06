import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';

interface TableCardProps {
  tableNumber: string | number;
  status: 'free' | 'occupied' | 'billing' | 'reserved';
  orderTime?: string;
  itemCount?: number;
  total?: number;
  customerName?: string;
  onPress: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  free: COLORS.tableFree,
  occupied: COLORS.tableOccupied,
  billing: COLORS.tableBilling,
  reserved: COLORS.tableReserved,
};

const STATUS_LABELS: Record<string, string> = {
  free: 'खाली',
  occupied: 'व्यस्त',
  billing: 'बिलिंग',
  reserved: 'आरक्षित',
};

export default function TableCard({
  tableNumber,
  status,
  orderTime,
  itemCount,
  total,
  customerName,
  onPress,
}: TableCardProps) {
  const statusColor = STATUS_COLORS[status] || COLORS.tableFree;
  const statusLabel = STATUS_LABELS[status] || status;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          {statusLabel}
        </Text>
      </View>
      <Text style={styles.tableNumber}>{tableNumber}</Text>
      {customerName && (
        <Text style={styles.customerName} numberOfLines={1}>
          {customerName}
        </Text>
      )}
      {orderTime && (
        <Text style={styles.time}>{orderTime}</Text>
      )}
      {(itemCount !== undefined || total !== undefined) && (
        <View style={styles.footer}>
          {itemCount !== undefined && (
            <Text style={styles.itemCount}>{itemCount} items</Text>
          )}
          {total !== undefined && (
            <Text style={styles.total}>₹{total}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    maxWidth: 180,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    padding: SPACING.lg,
    margin: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: TOUCH_TARGET.preferred * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  tableNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  time: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  itemCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  total: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
