import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  Utensils,
  Bell,
  BellOff,
  AlertTriangle,
  MessageCircle,
  Loader2,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mockKdsOrders } from '../data/mockData';
import { WhatsAppService } from '../services/whatsappService';

/**
 * KDS (Kitchen Display System) — Full-screen, auto-refreshing view
 * for kitchen staff to see incoming, preparing, and ready orders.
 *
 * Features:
 * - Kanban columns: New Orders -> Preparing -> Ready to Serve
 * - 30-second auto-refresh (simulated; real API polling in production)
 * - Filter by: All / New / Cooking
 * - New-order alert sound (bell) with toggle
 * - Dark theme optimized for kitchen environments
 */
export default function KdsPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [whatsappLoading, setWhatsappLoading] = useState(null); // order id being sent
  const prevOrderCount = useRef(0);
  const audioCtxRef = useRef(null);

  // Play a short notification beep using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio not available — fail silently
    }
  }, []);

  // Load orders from mock data
  useEffect(() => {
    setOrders(mockKdsOrders);
    prevOrderCount.current = mockKdsOrders.length;

    // Simulate periodic refresh; in production this polls /api/v1/kds/orders
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Play alert sound when new orders arrive (if enabled)
  useEffect(() => {
    if (alertEnabled && orders.length > prevOrderCount.current) {
      playNotificationSound();
    }
    prevOrderCount.current = orders.length;
  }, [orders.length, alertEnabled, playNotificationSound]);

  // Send WhatsApp order ready notification
  const handleSendWhatsApp = useCallback(async (order) => {
    // Use waiter phone from mock staff or prompt
    const phone = window.prompt(
      `Send "Order Ready" notification to WhatsApp number for Order #${order.orderNumber}:\n(Include country code, e.g. 9198XXXXXXXX)`,
      '9198',
    );
    if (!phone || phone.length < 10) {
      toast.error('Valid WhatsApp number required (e.g. 9198XXXXXXXX)');
      return;
    }

    setWhatsappLoading(order.id);
    try {
      const result = await WhatsAppService.sendOrderReady(
        phone,
        parseInt(order.orderNumber, 10),
        order.tableNumber,
      );

      if (result.success) {
        toast.success(`Order #${order.orderNumber} notification sent on WhatsApp!`);
      } else {
        toast.error(`WhatsApp failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      toast.error('Failed to send WhatsApp notification');
    } finally {
      setWhatsappLoading(null);
    }
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filter === 'pending') return o.status === 'PENDING';
    if (filter === 'preparing') return o.status === 'PREPARING';
    return true;
  });

  // Group by status for kanban-like view
  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'PREPARING');
  const readyOrders = filteredOrders.filter((o) => o.status === 'SERVED');

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <ChefHat className="w-10 h-10 text-[#FF6B35]" />
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
              <span className="mx-1">|</span>
              {isOnline ? (
                <span className="text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Online
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Filter tabs */}
          <div className="flex bg-white/10 rounded-lg p-1">
            {['all', 'pending', 'preparing'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  filter === f
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {f === 'all'
                  ? `All (${orders.length})`
                  : f === 'pending'
                    ? 'New'
                    : 'Cooking'}
              </button>
            ))}
          </div>
          {/* Alert toggle */}
          <button
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={`p-2 rounded-lg transition ${
              alertEnabled
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 text-gray-500'
            }`}
            title={alertEnabled ? 'Mute alerts' : 'Enable alerts'}
          >
            {alertEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Pending Column */}
        <KdsColumn
          title="New Orders"
          icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
          orders={pendingOrders}
          color="yellow"
          emptyMsg="No new orders"
          onAccept={(order) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === order.id ? { ...o, status: 'PREPARING' } : o,
              ),
            );
          }}
        />

        {/* Preparing Column */}
        <KdsColumn
          title="Preparing"
          icon={<Utensils className="w-5 h-5 text-[#FF6B35]" />}
          orders={preparingOrders}
          color="orange"
          emptyMsg="Nothing cooking right now"
          onReady={(order) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === order.id ? { ...o, status: 'SERVED' } : o,
              ),
            );
          }}
        />

        {/* Ready Column */}
        <KdsColumn
          title="Ready to Serve"
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          orders={readyOrders}
          color="green"
          emptyMsg="All orders served"
          onServe={(order) => {
            setOrders((prev) => prev.filter((o) => o.id !== order.id));
          }}
          whatsappLoading={whatsappLoading}
          onSendWhatsApp={(order) => handleSendWhatsApp(order)}
        />
      </div>
    </div>
  );
}

// ─── KDS Column Component ─────────────────────────────────────────────────
function KdsColumn({ title, icon, orders, color, emptyMsg, onAccept, onReady, onServe, whatsappLoading, onSendWhatsApp }) {
  const borderColor =
    color === 'yellow'
      ? 'border-yellow-400/30'
      : color === 'orange'
        ? 'border-[#FF6B35]/30'
        : 'border-green-400/30';

  const emptyIconColor =
    color === 'yellow'
      ? 'text-yellow-500/30'
      : color === 'orange'
        ? 'text-[#FF6B35]/30'
        : 'text-green-500/30';

  return (
    <div className={`bg-white/5 rounded-2xl border ${borderColor} flex flex-col overflow-hidden`}>
      {/* Column Header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-white/[0.02]">
        {icon}
        <h2 className="font-semibold text-base">{title}</h2>
        <span className="ml-auto bg-white/10 rounded-full px-3 py-1 text-sm font-medium">
          {orders.length}
        </span>
      </div>

      {/* Order Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence>
          {orders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-500 gap-2"
            >
              <CheckCircle2 className={`w-12 h-12 ${emptyIconColor}`} />
              <p className="text-sm">{emptyMsg}</p>
            </motion.div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white/10 rounded-xl p-4 hover:bg-white/[0.14] transition-colors"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">#{order.orderNumber}</span>
                    <span className="text-sm text-gray-400 bg-white/10 rounded-md px-2 py-0.5">
                      Table {order.tableNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{order.timeElapsed}</span>
                  </div>
                </div>

                {/* Waiter info */}
                {order.waiter && (
                  <div className="text-xs text-gray-500 mb-2">
                    Waiter: {order.waiter}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1.5 mb-4">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-100">
                        <span className="font-medium">{item.quantity}x</span>{' '}
                        {item.name}
                        {item.modifiers?.length > 0 && (
                          <span className="text-gray-400 ml-1 text-xs">
                            ({item.modifiers.join(', ')})
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.status === 'PREPARING'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : item.status === 'SERVED'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        {item.status === 'PREPARING'
                          ? 'Cooking'
                          : item.status === 'SERVED'
                            ? 'Done'
                            : 'Wait'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="text-yellow-200 text-sm mb-3 bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20">
                    <span className="font-medium">Note:</span> {order.notes}
                  </div>
                )}

                {/* Action Buttons */}
                {onAccept && (
                  <button
                    onClick={() => onAccept(order)}
                    className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg py-2.5 text-sm font-semibold transition active:scale-[0.98]"
                  >
                    Accept & Start Cooking
                  </button>
                )}
                {onReady && (
                  <button
                    onClick={() => onReady(order)}
                    className="w-full bg-[#FF6B35]/20 hover:bg-[#FF6B35]/30 text-[#FF6B35] rounded-lg py-2.5 text-sm font-semibold transition active:scale-[0.98]"
                  >
                    Mark as Ready
                  </button>
                )}
                {onServe && (
                  <button
                    onClick={() => onServe(order)}
                    className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg py-2.5 text-sm font-semibold transition active:scale-[0.98]"
                  >
                    Served
                  </button>
                )}
                {onSendWhatsApp && (
                  <button
                    onClick={() => onSendWhatsApp(order)}
                    disabled={whatsappLoading === order.id}
                    className="w-full flex items-center justify-center gap-2 mt-2 bg-green-500/10 hover:bg-green-500/20 text-green-300 rounded-lg py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {whatsappLoading === order.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <MessageCircle size={14} />
                    )}
                    {whatsappLoading === order.id ? 'Sending...' : 'Notify on WhatsApp'}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
