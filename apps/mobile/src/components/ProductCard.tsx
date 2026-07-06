import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';

interface ProductCardProps {
  name: string;
  nameHindi?: string;
  price: number;
  category?: string;
  onAdd: () => void;
}

export default function ProductCard({ name, nameHindi, price, onAdd }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {nameHindi && <Text style={styles.nameHindi}>{nameHindi}</Text>}
        <Text style={styles.price}>₹{price}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAdd}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  info: {
    flex: 1,
    marginRight: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  nameHindi: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  price: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  addButton: {
    width: TOUCH_TARGET.preferred,
    height: TOUCH_TARGET.preferred,
    borderRadius: TOUCH_TARGET.preferred / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    lineHeight: FONT_SIZES.xxl + 4,
  },
});
