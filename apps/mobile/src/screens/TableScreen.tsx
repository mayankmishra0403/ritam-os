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
import { tablesApi } from '../services/api';
import TableCard from '../components/TableCard';

const SECTIONS = ['all', 'indoor', 'outdoor', 'vip'] as const;
const SECTION_LABELS: Record<string, { hi: string; en: string }> = {
  all: { hi: 'सभी', en: 'All' },
  indoor: { hi: 'इनडोर', en: 'Indoor' },
  outdoor: { hi: 'आउटडोर', en: 'Outdoor' },
  vip: { hi: 'वीआईपी', en: 'VIP' },
};

export default function TableScreen({ navigation }: any) {
  const [tables, setTables] = useState<any[]>([]);
  const [filteredTables, setFilteredTables] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTables = useCallback(async () => {
    try {
      const res = await tablesApi.list('default');
      setTables(res.data.data || res.data);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load tables' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (activeSection === 'all') {
      setFilteredTables(tables);
    } else {
      setFilteredTables(tables.filter((t) => t.section === activeSection));
    }
  }, [tables, activeSection]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTables();
  }, [fetchTables]);

  const handleTablePress = (table: any) => {
    if (table.status === 'free') {
      navigation.navigate('Billing', { tableId: table._id, tableNumber: table.number });
    } else {
      navigation.navigate('Billing', {
        tableId: table._id,
        tableNumber: table.number,
        orderId: table.currentOrder,
      });
    }
  };

  const renderTable = ({ item }: { item: any }) => (
    <TableCard
      tableNumber={item.number || item.tableNumber}
      status={item.status}
      orderTime={item.orderTime}
      itemCount={item.itemCount}
      total={item.total}
      customerName={item.customerName}
      onPress={() => handleTablePress(item)}
    />
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
        <View>
          <Text style={styles.title}>टेबल्स</Text>
          <Text style={styles.titleEn}>Tables</Text>
        </View>
        <Text style={styles.date}>{new Date().toLocaleDateString('hi-IN')}</Text>
      </View>

      <View style={styles.sectionRow}>
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section}
            style={[styles.sectionChip, activeSection === section && styles.activeSectionChip]}
            onPress={() => setActiveSection(section)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionText, activeSection === section && styles.activeSectionText]}>
              {SECTION_LABELS[section].hi}
            </Text>
            <Text style={[styles.sectionTextEn, activeSection === section && styles.activeSectionText]}>
              {SECTION_LABELS[section].en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTables}
        renderItem={renderTable}
        keyExtractor={(item) => item._id || item.id || String(item.number)}
        numColumns={4}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>कोई टेबल नहीं</Text>
            <Text style={styles.emptyTextEn}>No tables available</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  date: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  sectionRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: TOUCH_TARGET.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSectionChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sectionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionTextEn: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  activeSectionText: {
    color: COLORS.white,
  },
  grid: {
    padding: SPACING.sm,
  },
  row: {
    justifyContent: 'flex-start',
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
