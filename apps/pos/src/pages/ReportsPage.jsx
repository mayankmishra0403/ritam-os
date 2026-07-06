import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Smartphone,
  CreditCard,
  Download,
  ChevronDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const dateRanges = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

// Mock sales data
const mockSalesData = {
  today: {
    totalSales: 28450,
    totalOrders: 42,
    avgOrderValue: 677,
    cashTotal: 10200,
    upiTotal: 12450,
    cardTotal: 5800,
    dailySales: [2850, 3200, 4100, 2800, 3500, 6200, 5800],
    topItems: [
      { rank: 1, name: 'Butter Chicken', qty: 18, revenue: 8082 },
      { rank: 2, name: 'Chicken Biryani', qty: 15, revenue: 5985 },
      { rank: 3, name: 'Garlic Naan', qty: 25, revenue: 1725 },
      { rank: 4, name: 'Dal Makhani', qty: 12, revenue: 3588 },
      { rank: 5, name: 'Paneer Tikka', qty: 10, revenue: 2990 },
    ],
  },
};

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState('today');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const data = mockSalesData.today;

  const statsCards = useMemo(
    () => [
      {
        label: 'Total Sales',
        value: `₹${data.totalSales.toLocaleString('en-IN')}`,
        icon: IndianRupee,
        color: 'text-[#FF6B35]',
        bg: 'bg-[#FF6B35]/10',
      },
      {
        label: 'Total Orders',
        value: data.totalOrders,
        icon: ShoppingBag,
        color: 'text-[#06D6A0]',
        bg: 'bg-[#06D6A0]/10',
      },
      {
        label: 'Avg. Order Value',
        value: `₹${data.avgOrderValue}`,
        icon: TrendingUp,
        color: 'text-[#118AB2]',
        bg: 'bg-[#118AB2]/10',
      },
      {
        label: 'Payment Split',
        value: (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Wallet size={12} /> ₹{(data.cashTotal / 1000).toFixed(1)}k
            </span>
            <span className="flex items-center gap-1">
              <Smartphone size={12} /> ₹{(data.upiTotal / 1000).toFixed(1)}k
            </span>
            <span className="flex items-center gap-1">
              <CreditCard size={12} /> ₹{(data.cardTotal / 1000).toFixed(1)}k
            </span>
          </div>
        ),
        icon: BarChart3,
        color: 'text-[#1A1A2E]',
        bg: 'bg-[#1A1A2E]/5',
      },
    ],
    [data]
  );

  // Sales bar chart data (hourly for today)
  const hours = ['10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'];
  const hourlySales = [1200, 1800, 3500, 4200, 2800, 1500, 900, 2200, 4500, 3800, 2100, 800, 0];
  const maxHourly = Math.max(...hourlySales);

  // Payment breakdown (simple CSS pie chart)
  const totalPayments = data.cashTotal + data.upiTotal + data.cardTotal;
  const cashPct = (data.cashTotal / totalPayments) * 100;
  const upiPct = (data.upiTotal / totalPayments) * 100;
  const cardPct = (data.cardTotal / totalPayments) * 100;

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Sales overview and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <div className="relative">
            <button
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#F0E6DC] bg-white text-sm font-medium hover:bg-[#FFF8F0] transition-colors"
            >
              {dateRanges.find((r) => r.id === selectedRange)?.label}
              <ChevronDown size={16} />
            </button>
            {showRangeDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#F0E6DC] py-1 z-10">
                {dateRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => {
                      setSelectedRange(range.id);
                      setShowRangeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedRange === range.id
                        ? 'bg-[#FF6B35]/10 text-[#FF6B35] font-medium'
                        : 'text-[#1A1A2E] hover:bg-[#FFF8F0]'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => toast.success('Report downloaded')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-sm font-medium hover:bg-[#2A2A3E] transition-colors"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-[#F0E6DC] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#6B7280]">{card.label}</span>
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1A1A2E]">{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl border border-[#F0E6DC] p-5"
        >
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-4">Hourly Sales Today</h3>
          <div className="flex items-end gap-2 h-40">
            {hourlySales.slice(0, 12).map((sale, i) => {
              const height = (sale / maxHourly) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{sale.toLocaleString('en-IN')}
                  </span>
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-[#FF6B35] to-[#FF8F5E] transition-all duration-300 hover:opacity-80"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <span className="text-[10px] text-[#6B7280] mt-1">{hours[i]}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Payment Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-[#F0E6DC] p-5"
        >
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-4">Payment Breakdown</h3>
          <div className="flex flex-col items-center">
            {/* Pie representation using conic-gradient */}
            <div
              className="w-36 h-36 rounded-full mb-4"
              style={{
                background: `conic-gradient(
                  #06D6A0 0% ${cashPct}%,
                  #FF6B35 ${cashPct}% ${cashPct + upiPct}%,
                  #118AB2 ${cashPct + upiPct}% 100%
                )`,
              }}
            />
            <div className="w-full space-y-2">
              {[
                { label: 'Cash', value: data.cashTotal, pct: cashPct, color: '#06D6A0' },
                { label: 'UPI', value: data.upiTotal, pct: upiPct, color: '#FF6B35' },
                { label: 'Card', value: data.cardTotal, pct: cardPct, color: '#118AB2' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#6B7280]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1A1A2E]">
                      ₹{(item.value / 1000).toFixed(1)}k
                    </span>
                    <span className="text-xs text-[#6B7280]">{item.pct.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Selling Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-[#F0E6DC] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#F0E6DC]">
          <h3 className="text-sm font-semibold text-[#1A1A2E]">Top Selling Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0E6DC] bg-[#FFF8F0]">
                <th className="text-left px-5 py-3 font-medium text-[#6B7280]">#</th>
                <th className="text-left px-5 py-3 font-medium text-[#6B7280]">Item Name</th>
                <th className="text-right px-5 py-3 font-medium text-[#6B7280]">Qty Sold</th>
                <th className="text-right px-5 py-3 font-medium text-[#6B7280]">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topItems.map((item) => (
                <tr key={item.rank} className="border-b border-[#F0E6DC]/50 hover:bg-[#FFF8F0] transition-colors">
                  <td className="px-5 py-3 text-[#6B7280] font-medium">{item.rank}</td>
                  <td className="px-5 py-3 font-medium text-[#1A1A2E]">{item.name}</td>
                  <td className="px-5 py-3 text-right">{item.qty}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
