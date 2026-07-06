import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  ShoppingBag,
  Printer,
  Search,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mockOrders } from '../data/mockData';

const tabs = [
  { id: 'ACTIVE', label: 'Active', icon: Clock },
  { id: 'COMPLETED', label: 'Completed', icon: CheckCircle },
  { id: 'CANCELLED', label: 'Cancelled', icon: XCircle },
];

const itemStatusConfig = {
  PENDING: { label: 'Pending', className: 'bg-[#FFD166]/20 text-[#B8860B]' },
  PREPARING: { label: 'Preparing', className: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
  SERVED: { label: 'Served', className: 'bg-[#06D6A0]/15 text-[#06D6A0]' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-500' },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => o.status === activeTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.tableNumber.toString().includes(q)
      );
    }
    if (sortBy === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else {
      result = [...result].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    return result;
  }, [orders, activeTab, searchQuery, sortBy]);

  const updateItemStatus = (orderId, itemId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          ),
        };
      })
    );
    toast.success(`Item status updated to ${newStatus}`);
  };

  const getElapsed = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Orders</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {orders.filter((o) => o.status === 'ACTIVE').length} active orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-[#F0E6DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 w-56"
            />
          </div>
          <button
            onClick={() => {
              setOrders([...mockOrders]);
              toast.success('Orders refreshed');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#F0E6DC] text-sm font-medium text-[#6B7280] hover:bg-[#FFF8F0] transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 border border-[#F0E6DC] w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#FFF8F0]'
            }`}
          >
            <Icon size={16} />
            {label}
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === id
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F0E6DC] text-[#6B7280]'
              }`}
            >
              {orders.filter((o) => o.status === id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto">
        {selectedOrder ? (
          /* KOT / Order Detail View */
          <div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A2E] mb-4 transition-colors"
            >
              ← Back to orders
            </button>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#F0E6DC] overflow-hidden">
              {/* KOT Header */}
              <div className="bg-[#1A1A2E] text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">KOT #{selectedOrder.id}</p>
                    <p className="text-lg font-bold">Table {selectedOrder.tableNumber}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                </div>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F0E6DC]">
                      <th className="text-left py-2 font-medium text-[#6B7280]">#</th>
                      <th className="text-left py-2 font-medium text-[#6B7280]">Item</th>
                      <th className="text-center py-2 font-medium text-[#6B7280]">Qty</th>
                      <th className="text-right py-2 font-medium text-[#6B7280]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-[#F0E6DC]/50">
                        <td className="py-3 text-[#6B7280]">{idx + 1}</td>
                        <td className="py-3 font-medium">{item.name}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              itemStatusConfig[item.status]?.className
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-xl border border-[#F0E6DC] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="px-4 py-3 border-b border-[#F0E6DC] flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-[#1A1A2E]">
                        #{order.id}
                      </span>
                      <span className="text-xs text-[#6B7280] ml-2">
                        Table {order.tableNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <Clock size={12} />
                        {getElapsed(order.createdAt)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs text-[#FF6B35] hover:underline"
                      >
                        View KOT
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#6B7280]">
                            {item.quantity}x
                          </span>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              itemStatusConfig[item.status]?.className
                            }`}
                          >
                            {itemStatusConfig[item.status]?.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions (only for active orders) */}
                  {order.status === 'ACTIVE' && (
                    <div className="px-4 py-3 border-t border-[#F0E6DC] flex gap-2">
                      {order.items.some((i) => i.status === 'PENDING') && (
                        <button
                          onClick={() => {
                            order.items
                              .filter((i) => i.status === 'PENDING')
                              .forEach((i) =>
                                updateItemStatus(order.id, i.id, 'PREPARING')
                              );
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium hover:bg-[#FF6B35]/20 transition-colors"
                        >
                          <ChefHat size={14} />
                          Start Preparing
                        </button>
                      )}
                      {order.items.some((i) => i.status === 'PREPARING') && (
                        <button
                          onClick={() => {
                            order.items
                              .filter((i) => i.status === 'PREPARING')
                              .forEach((i) =>
                                updateItemStatus(order.id, i.id, 'SERVED')
                              );
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06D6A0]/10 text-[#06D6A0] text-xs font-medium hover:bg-[#06D6A0]/20 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Mark Served
                        </button>
                      )}
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A2E]/5 text-[#6B7280] text-xs font-medium hover:bg-[#1A1A2E]/10 transition-colors ml-auto">
                        <Printer size={14} />
                        Print
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredOrders.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#6B7280]">
                <ShoppingBag size={48} className="mb-3 opacity-30" />
                <p className="text-lg font-medium">No {activeTab.toLowerCase()} orders</p>
                <p className="text-sm">Orders will appear here once placed</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
