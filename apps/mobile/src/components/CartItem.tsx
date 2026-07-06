import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';

interface CartItemProps {
  name: string;
  nameHindi?: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartItem({
  name,
  nameHindi,
  quantity,
  price,
  modifiers,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        {nameHindi && <Text style={styles.nameHindi}>{nameHindi}</Text>}
        {modifiers && modifiers.length > 0 && (
          <Text style={styles.modifiers}>{modifiers.join(', ')}</Text>
        )}
        <Text style={styles.price}>₹{price}</Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.qtyButton} onPress={onDecrement} activeOpacity={0.7}>
          <Text style={styles.qtyButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity style={styles.qtyButton} onPress={onIncrement} activeOpacity={0.7}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.totalPrice}>₹{price * quantity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: TOUCH_TARGET.preferred + SPACING.md,
  },
  info: {
    flex: 1,
    marginRight: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  removeIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.danger,
    marginLeft: SPACING.sm,
  },
  nameHindi: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 1,
  },
  modifiers: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  price: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: FONT_SIZES.lg + 2,
  },
  quantity: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    minWidth: 24,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 60,
    textAlign: 'right',
  },
});
