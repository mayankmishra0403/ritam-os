import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';

type TabType = 'login' | 'register';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');

  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email && !phone) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter email or phone' });
      return;
    }
    if (!password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter password' });
      return;
    }
    setLoading(true);
    try {
      const identifier = email || phone;
      const res = await authApi.login(identifier, password);
      await login(res.data.token, res.data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !restaurantName) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, phone, password, restaurantName });
      await login(res.data.token, res.data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FF6B35', '#E85D04']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Text style={styles.logoHindi}>ऋतम्</Text>
            <Text style={styles.logoEn}>Ritam</Text>
            <Text style={styles.subtitle}>पॉइंट ऑफ़ सेल सिस्टम</Text>
            <Text style={styles.subtitleEn}>Point of Sale System</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  लॉगिन
                </Text>
                <Text style={[styles.tabTextEn, activeTab === 'login' && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                  रजिस्टर
                </Text>
                <Text style={[styles.tabTextEn, activeTab === 'register' && styles.activeTabText]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'login' ? (
              <View style={styles.form}>
                <Text style={styles.label}>ईमेल / Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.label}>या फ़ोन / Or Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={COLORS.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <Text style={styles.label}>पासवर्ड / Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.submitText}>लॉगिन करें / Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.label}>नाम / Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={COLORS.textLight}
                  value={name}
                  onChangeText={setName}
                />
                <Text style={styles.label}>ईमेल / Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.label}>फ़ोन / Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={COLORS.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <Text style={styles.label}>पासवर्ड / Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create password"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Text style={styles.label}>रेस्तरां / Restaurant Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your restaurant name"
                  placeholderTextColor={COLORS.textLight}
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                />
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.submitText}>रजिस्टर करें / Register</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoHindi: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
  },
  logoEn: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
  },
  subtitleEn: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 480,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minHeight: TOUCH_TARGET.min,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  tabTextEn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.white,
  },
  form: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    minHeight: TOUCH_TARGET.preferred,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET.preferred,
    marginTop: SPACING.xl,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
