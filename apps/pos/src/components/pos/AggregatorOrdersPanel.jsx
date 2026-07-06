import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  ChefHat,
  Bike,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { mockAggregatorOrders } from '../../data/mockData';

const platformConfig = {
  SWIGGY: {
    label: 'Swiggy',
    color: '#FC8019',
    bgColor: 'bg-[#FC8019]',
    bgLight: 'bg-[#FC8019]/10',
    textColor: 'text-[#FC8019]',
    borderColor: 'border-[#FC8019]/30',
    icon: 'S',
  },
  ZOMATO: {
    label: 'Zomato',
    color: '#E23744',
    bgColor: 'bg-[#E23744]',
    bgLight: 'bg-[#E23744]/10',
    textColor: 'text-[#E23744]',
    borderColor: 'border-[#E23744]/30',
    icon: 'Z',
  },
};

const statusConfig = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-500/20 text-yellow-400',
    nextStatus: 'ACCEPTED',
    nextLabel: 'Accept Order',
    nextIcon: CheckCircle,
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'bg-blue-500/20 text-blue-400',
    nextStatus: 'PREPARING',
    nextLabel: 'Start Preparing',
    nextIcon: ChefHat,
  },
  PREPARING: {
    label: 'Preparing',
    className: 'bg-[#FF6B35]/15 text-[#FF6B35]',
    nextStatus: 'READY_FOR_PICKUP',
    nextLabel: 'Ready for Pickup',
    nextIcon: CheckCircle,
  },
  READY_FOR_PICKUP: {
    label: 'Ready',
    className: 'bg-green-500/20 text-green-400',
    nextStatus: 'OUT_FOR_DELIVERY',
    nextLabel: 'Mark Out for Delivery',
    nextIcon: Bike,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    className: 'bg-purple-500/20 text-purple-400',
    nextStatus: 'DELIVERED',
    nextLabel: 'Mark Delivered',
    nextIcon: CheckCircle,
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-[#06D6A0]/20 text-[#06D6A0]',
    nextStatus: null,
    nextLabel: null,
    nextIcon: null,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-500/20 text-red-400',
    nextStatus: null,
    nextLabel: null,
    nextIcon: null,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-gray-500/20 text-gray-400',
    nextStatus: null,
    nextLabel: null,
    nextIcon: null,
  },
};

export default function AggregatorOrdersPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [orders, setOrders] = useState(mockAggregatorOrders);
  const [newOrderFlash, setNewOrderFlash] = useState(false);
  const [previousCount, setPreviousCount] = useState(mockAggregatorOrders.length);

  const pendingCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'READY_FOR_PICKUP',
  ).length;

  // Simulate auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate checking for new orders
      // In production, this would poll the API or use WebSocket
      setOrders((prev) => {
        const currentActive = prev.filter((o) => o.status !== 'DELIVERED' && o.status !== 'REJECTED' && o.status !== 'CANCELLED').length;
        if (currentActive > 0) {
          // Update time elapsed
          return prev.map((o) => {
            const mins = parseInt(o.timeElapsed?.split(' ')[0] || '0') + 0.5;
            return {
              ...o,
              timeElapsed: `${Math.floor(mins)} min ago`,
            };
          });
        }
        return prev;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Flash effect when new orders arrive (simulated)
  useEffect(() => {
    const currentActive = orders.filter(
      (o) => o.status === 'PENDING',
    ).length;

    if (currentActive > previousCount) {
      setNewOrderFlash(true);
      const timer = setTimeout(() => setNewOrderFlash(false), 2000);
      return () => clearTimeout(timer);
    }
    setPreviousCount(currentActive);
  }, [orders.length, previousCount]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return { ...order, status: newStatus };
      }),
    );
  }, []);

  const getNextAction = (status) => {
    return statusConfig[status];
  };

  const formatCurrency = (amount) => {
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="border-t border-white/10">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative ${
          isExpanded ? 'bg-white/5' : 'hover:bg-white/5'
        } ${newOrderFlash ? 'animate-pulse bg-[#FC8019]/20' : ''}`}
      >
        <div className="relative">
          <ShoppingBag size={18} className="text-[#FC8019]" />
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-white">Online Orders</span>
          {pendingCount > 0 && (
            <span className="ml-2 text-xs text-white/50">
              ({pendingCount} active)
            </span>
          )}
        </div>
        {newOrderFlash && (
          <span className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#FC8019] font-medium">
            <Bell size={12} className="animate-bounce" />
            New!
          </span>
        )}
        {isExpanded ? (
          <ChevronUp size={16} className="text-white/50" />
        ) : (
          <ChevronDown size={16} className="text-white/50" />
        )}
      </button>

      {/* Expanded Panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-3 space-y-2 max-h-[400px] overflow-y-auto">
              {orders.length === 0 ? (
                <div className="text-center py-6 text-white/30 text-xs">
                  <ShoppingBag size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No online orders yet</p>
                </div>
              ) : (
                orders
                  .filter(
                    (o) =>
                      o.status !== 'DELIVERED' &&
                      o.status !== 'REJECTED' &&
                      o.status !== 'CANCELLED',
                  )
                  .map((order, index) => {
                    const platform = platformConfig[order.platform];
                    const statusInfo = statusConfig[order.status];
                    const nextAction = getNextAction(order.status);

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl overflow-hidden border ${
                          platform?.borderColor || 'border-white/10'
                        } bg-[#1A1A2E]/80 backdrop-blur-sm`}
                      >
                        {/* Platform Header */}
                        <div
                          className={`flex items-center justify-between px-3 py-2 ${
                            platform?.bgLight || 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${
                                platform?.bgColor || 'bg-gray-500'
                              }`}
                            >
                              {platform?.icon || '?'}
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                platform?.textColor || 'text-white'
                              }`}
                            >
                              {platform?.label || order.platform}
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">
                              #{order.platformOrderId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                statusInfo?.className || 'bg-white/10 text-white/50'
                              }`}
                            >
                              {statusInfo?.label || order.status}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-white/40">
                              <Clock size={10} />
                              {order.timeElapsed}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="px-3 py-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">
                              {order.customerName}
                            </span>
                            <span className="text-xs text-white/50">
                              {formatCurrency(order.total)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                            <MapPin size={10} />
                            <span className="truncate">{order.address}</span>
                          </div>

                          {order.customerPhone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                              <Phone size={10} />
                              <span>{order.customerPhone}</span>
                            </div>
                          )}

                          {order.deliveryPartner && (
                            <div className="flex items-center gap-1.5 text-[11px] text-purple-400">
                              <Bike size={10} />
                              <span>{order.deliveryPartner}</span>
                            </div>
                          )}
                        </div>

                        {/* Items List */}
                        <div className="px-3 pb-1 space-y-0.5">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px]"
                            >
                              <span className="text-white/70">
                                <span className="text-white/40">{item.quantity}x</span>{' '}
                                {item.name}
                              </span>
                              <span className="text-white/50">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Payment Badge */}
                        <div className="px-3 pb-2">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider ${
                              order.paymentMethod === 'COD'
                                ? 'bg-yellow-500/15 text-yellow-400'
                                : 'bg-green-500/15 text-green-400'
                            }`}
                          >
                            {order.paymentMethod}
                          </span>
                        </div>

                        {/* Actions */}
                        {order.status === 'PENDING' && (
                          <div className="flex gap-1.5 px-3 pb-3">
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#06D6A0]/20 text-[#06D6A0] text-[11px] font-medium hover:bg-[#06D6A0]/30 transition-colors"
                            >
                              <CheckCircle size={12} />
                              Accept
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'REJECTED')}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-[11px] font-medium hover:bg-red-500/30 transition-colors"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </div>
                        )}

                        {nextAction?.nextStatus && order.status !== 'PENDING' && (
                          <div className="px-3 pb-3">
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, nextAction.nextStatus)
                              }
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#FF6B35]/15 text-[#FF6B35] text-[11px] font-medium hover:bg-[#FF6B35]/25 transition-colors"
                            >
                              <nextAction.nextIcon size={12} />
                              {nextAction.nextLabel}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
              )}

              {/* Delivered / Completed Orders Summary */}
              {orders.filter(
                (o) =>
                  o.status === 'DELIVERED' ||
                  o.status === 'REJECTED' ||
                  o.status === 'CANCELLED',
              ).length > 0 && (
                <div className="pt-1">
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-white/30 hover:text-white/50 transition-colors">
                    <Clock size={12} />
                    View completed ({orders.filter((o) => o.status === 'DELIVERED').length} delivered)
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
