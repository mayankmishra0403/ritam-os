import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

interface SettingRowProps {
  label: string;
  labelEn: string;
  value: string | boolean;
  type?: 'text' | 'toggle';
  onToggle?: (value: boolean) => void;
}

function SettingRow({ label, labelEn, value, type = 'text', onToggle }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.settingText}>{label}</Text>
        <Text style={styles.settingTextEn}>{labelEn}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [voiceOrdering, setVoiceOrdering] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'लॉगआउट / Logout',
      'क्या आप लॉगआउट करना चाहते हैं? / Are you sure?',
      [
        { text: 'रद्द करें / Cancel', style: 'cancel' },
        {
          text: 'लॉगआउट / Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Toast.show({ type: 'success', text1: 'Logged out' });
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>सेटिंग्स</Text>
        <Text style={styles.titleEn}>Settings</Text>
      </View>

      {/* Outlet Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>आउटलेट / Outlet</Text>
        <SettingRow
          label="रेस्तरां / Restaurant"
          labelEn="Restaurant"
          value={user?.restaurantName || user?.outletName || 'Ritam'}
        />
        <SettingRow
          label="ईमेल / Email"
          labelEn="Email"
          value={user?.email || '-'}
        />
        <SettingRow
          label="फ़ोन / Phone"
          labelEn="Phone"
          value={user?.phone || '-'}
        />
      </View>

      {/* Staff Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>स्टाफ़ / Staff</Text>
        <SettingRow
          label="नाम / Name"
          labelEn="Name"
          value={user?.name || 'Staff'}
        />
        <SettingRow
          label="भूमिका / Role"
          labelEn="Role"
          value={user?.role || 'Manager'}
        />
      </View>

      {/* Printer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>प्रिंटर / Printer</Text>
        <SettingRow
          label="थर्मल प्रिंटर / Thermal Printer"
          labelEn="Thermal Printer"
          value={user?.printerName || 'Not configured'}
        />
        <TouchableOpacity style={styles.configureButton} activeOpacity={0.7}>
          <Text style={styles.configureText}>कॉन्फ़िगर करें / Configure</Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>सुविधाएँ / Features</Text>
        <SettingRow
          label="Whatsapp ऑर्डर / WhatsApp Order"
          labelEn="WhatsApp Order"
          type="toggle"
          value={whatsappEnabled}
          onToggle={setWhatsappEnabled}
        />
        <SettingRow
          label="वॉइस ऑर्डरिंग / Voice Ordering"
          labelEn="Voice Ordering"
          type="toggle"
          value={voiceOrdering}
          onToggle={setVoiceOrdering}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={styles.logoutText}>लॉगआउट / Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ritam POS v1.0.0</Text>
        <Text style={styles.footerText}>ऋतम् पॉइंट ऑफ़ सेल</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: TOUCH_TARGET.min,
  },
  settingLabel: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  settingTextEn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  settingValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  configureButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: TOUCH_TARGET.min,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  configureText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: TOUCH_TARGET.preferred,
    justifyContent: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
});
