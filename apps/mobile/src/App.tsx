import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from './store/authStore';
import { COLORS, FONT_SIZES, SPACING } from './constants/theme';
import LoginScreen from './screens/LoginScreen';
import TableScreen from './screens/TableScreen';
import BillingScreen from './screens/BillingScreen';
import OrdersScreen from './screens/OrdersScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, color, size }: { name: keyof typeof Ionicons.glyphMap; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function BillingTabScreen({ navigation }: any) {
  return (
    <View style={styles.tabPlaceholder}>
      <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.tabPlaceholderText}>बिलिंग शुरू करें</Text>
      <Text style={styles.tabPlaceholderTextEn}>Select a table to start billing</Text>
      <TouchableOpacity
        style={styles.tabPlaceholderButton}
        onPress={() => navigation.navigate('Tables')}
        activeOpacity={0.7}
      >
        <Text style={styles.tabPlaceholderButtonText}>टेबल्स पर जाएं / Go to Tables</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Tables"
        component={TableScreen}
        options={{
          tabBarLabel: 'टेबल्स',
          tabBarIcon: ({ color, size }) => <TabIcon name="grid-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="BillingTab"
        component={BillingTabScreen}
        options={{
          tabBarLabel: 'बिलिंग',
          tabBarIcon: ({ color, size }) => <TabIcon name="receipt-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'ऑर्डर',
          tabBarIcon: ({ color, size }) => <TabIcon name="list-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'सेटिंग्स',
          tabBarIcon: ({ color, size }) => <TabIcon name="settings-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Billing" component={BillingScreen} />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  tabPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xxl,
  },
  tabPlaceholderText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  tabPlaceholderTextEn: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  tabPlaceholderButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  tabPlaceholderButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
