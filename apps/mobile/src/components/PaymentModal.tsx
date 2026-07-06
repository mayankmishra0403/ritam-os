import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';

interface PaymentModalProps {
  visible: boolean;
  total: number;
  onClose: () => void;
  onPayment: (method: 'cash' | 'upi' | 'card') => void;
}

const paymentMethods = [
  { key: 'cash', label: 'कैश', labelEn: 'Cash', icon: '💰' },
  { key: 'upi', label: 'UPI', labelEn: 'UPI', icon: '📱' },
  { key: 'card', label: 'कार्ड', labelEn: 'Card', icon: '💳' },
] as const;

export default function PaymentModal({ visible, total, onClose, onPayment }: PaymentModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>भुगतान</Text>
          <Text style={styles.titleEn}>Payment</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>कुल राशि</Text>
            <Text style={styles.amountValue}>₹{total}</Text>
          </View>

          <View style={styles.methods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.key}
                style={styles.methodButton}
                onPress={() => onPayment(method.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodLabelEn}>{method.labelEn}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>रद्द करें / Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    width: '80%',
    maxWidth: 500,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  titleEn: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  amountLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  amountValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  methods: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    minHeight: TOUCH_TARGET.preferred * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  methodLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  methodLabelEn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
});
