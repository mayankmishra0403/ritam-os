import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock, ChefHat, Bell, Coffee, ArrowLeft } from 'lucide-react';
import useOrderStore from '../store/orderStore';

const ORDER_STATUSES = [
  { id: 'received', label: 'Order Received', labelHi: 'ऑर्डर प्राप्त हुआ', icon: Check },
  { id: 'preparing', label: 'Preparing', labelHi: 'तैयार हो रहा है', icon: ChefHat },
  { id: 'ready', label: 'Ready to Serve', labelHi: 'सर्व करने के लिए तैयार', icon: Bell },
  { id: 'served', label: 'Served', labelHi: 'सर्व कर दिया गया', icon: Coffee },
];

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const getCartTotal = useOrderStore((s) => s.getCartTotal);
  const getCartCount = useOrderStore((s) => s.getCartCount);
  const clearCart = useOrderStore((s) => s.clearCart);
  const tableNumber = useOrderStore((s) => s.tableNumber);
  const customerName = useOrderStore((s) => s.customerName);

  const [activeStatus, setActiveStatus] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const total = getCartTotal();
  const itemCount = getCartCount();

  // Simulate order progress
  useEffect(() => {
    // Clear cart when this page loads (order placed)
    // Actually we don't clear immediately — only after showing the page
    const timer1 = setTimeout(() => setShowContent(true), 500);

    // Simulate order progression
    const timers = [];
    for (let i = 1; i < ORDER_STATUSES.length; i++) {
      timers.push(
        setTimeout(() => {
          setActiveStatus(i);
        }, 2000 + i * 3000)
      );
    }

    // Clear cart after animation
    const clearTimer = setTimeout(() => {
      clearCart();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      timers.forEach((t) => clearTimeout(t));
      clearTimeout(clearTimer);
    };
  }, []);

  const handleOrderMore = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-3 safe-area-top">
        <motion.button
          className="tap-target flex items-center justify-center -ml-2"
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={showContent ? { scale: 1 } : {}}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
            delay: 0.3,
          }}
          className="relative mb-6"
        >
          <motion.div
            className="w-28 h-28 rounded-full bg-gradient-to-br from-success to-emerald-400 flex items-center justify-center shadow-lg shadow-success/30"
            animate={
              showContent
                ? {
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              initial={{ pathLength: 0, rotate: -90 }}
              animate={showContent ? { pathLength: 1, rotate: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            >
              <Check size={48} className="text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Sparkle particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-success/40"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 120],
                y: [0, (Math.random() - 0.5) * 120],
                opacity: [0.8, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1.2,
                delay: 0.8 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mb-2"
        >
          <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">
            Order Number / ऑर्डर नंबर
          </p>
          <h1 className="text-4xl font-bold text-gray-900 font-display">
            #{orderId}
          </h1>
        </motion.div>

        {/* Customer greeting */}
        {customerName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={showContent ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-500 mb-1"
          >
            Thanks, {customerName}! {/* customerName already has value */}
          </motion.p>
        )}

        {/* Table Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.65 }}
          className="badge-orange text-sm px-4 py-1.5 mb-4"
        >
          <Clock size={14} />
          Table {tableNumber || 3}
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-sm mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Clock size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Order Summary</p>
                <p className="text-xs text-gray-400">{itemCount} items</p>
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">₹{total}</span>
          </div>
          <div className="bg-orange-50 rounded-xl p-3.5 text-center">
            <p className="text-sm font-semibold text-orange-800">
              Order placed! Kitchen is preparing your food.
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              ऑर्डर दे दिया गया है! किचन आपका खाना तैयार कर रहा है।
            </p>
          </div>
        </motion.div>

        {/* Estimated Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 mb-6"
        >
          <Clock size={16} className="text-success" />
          <span className="text-sm text-gray-600">
            Estimated time:{' '}
            <span className="font-bold text-gray-900">15-20 minutes</span>
          </span>
        </motion.div>

        {/* Order Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-sm mb-8"
        >
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Order Status / ऑर्डर की स्थिति
          </h3>
          <div className="space-y-0">
            {ORDER_STATUSES.map((status, index) => {
              const isCompleted = index <= activeStatus;
              const isActive = index === activeStatus;
              const Icon = status.icon;

              return (
                <div key={status.id} className="flex items-start gap-3">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`timeline-dot ${
                        isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                      }`}
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.1, 1],
                            }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isCompleted ? (
                        <Check size={14} />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </motion.div>
                    {index < ORDER_STATUSES.length - 1 && (
                      <div
                        className={`timeline-line ${
                          index < activeStatus ? 'completed' : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Status text */}
                  <div className="pb-6">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-gray-900'
                          : isActive
                          ? 'text-primary'
                          : 'text-gray-400'
                      }`}
                    >
                      {status.label}
                    </p>
                    <p className={`text-xs ${isCompleted ? 'text-gray-400' : 'text-gray-300'}`}>
                      {status.labelHi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1 }}
          className="btn-primary w-full max-w-sm py-4 text-base shadow-lg shadow-primary/25"
          whileTap={{ scale: 0.97 }}
          onClick={handleOrderMore}
        >
          Order More — और ऑर्डर करें
        </motion.button>
      </div>
    </div>
  );
}
