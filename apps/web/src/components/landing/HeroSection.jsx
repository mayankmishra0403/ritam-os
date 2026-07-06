import { motion } from 'framer-motion';
import { Play, ArrowRight, IndianRupee, Wifi, Mic } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const stats = [
  {
    icon: IndianRupee,
    value: 'Zero Commission',
    label: 'Har transaction par 0% fee',
  },
  {
    icon: Wifi,
    value: 'Offline POS',
    label: 'Bina internet ke bhi chale',
  },
  {
    icon: Mic,
    value: 'Hindi Voice',
    label: 'Bol ke order karo',
  },
];

export function HeroSection({ onOpenContact }) {
  const handleWatchDemo = (e) => {
    e.preventDefault();
    const el = document.querySelector('#demo');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[hsl(var(--primary)/0.1)] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[hsl(var(--secondary)/0.08)] blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.4)] animate-pulse-slow" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-[hsl(var(--secondary)/0.3)] animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={fadeUp} className="space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                India's First Zero-Commission POS
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Apna Restaurant.
                <br />
                Aapka POS.
                <br />
                <span className="text-gradient">Zero Commission.</span>
              </h1>
              <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-xl leading-relaxed">
                Offline-first, Hindi voice-enabled POS jo Indian restaurants ke liye bana hai. Koi transaction fee nahi.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <a
                href="#demo"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector('#demo');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="btn-primary text-base"
              >
                Free Trial <ArrowRight className="w-4 h-4" />
              </a>
              <button onClick={handleWatchDemo} className="btn-secondary text-base">
                <Play className="w-4 h-4" /> Watch Demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 pt-4">
              {stats.map((stat) => (
                <div
                  key={stat.value}
                  className="glass-card p-4 text-center space-y-1"
                >
                  <stat.icon className="w-5 h-5 mx-auto text-[hsl(var(--primary))]" />
                  <div className="text-sm font-semibold text-[hsl(var(--foreground))]">{stat.value}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.15)] backdrop-blur-xl border border-[hsl(var(--border)/0.3)] flex items-center justify-center animate-float">
                <span className="text-2xl">🍽️</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-2xl bg-[hsl(var(--secondary)/0.12)] backdrop-blur-xl border border-[hsl(var(--border)/0.3)] flex items-center justify-center animate-float-delayed">
                <span className="text-3xl">📱</span>
              </div>

              {/* Phone Body */}
              <div className="relative w-[280px] h-[560px] rounded-[3rem] bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--secondary))] p-3 shadow-2xl">
                <div className="w-full h-full rounded-[2.5rem] bg-white overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />

                  {/* Screen Content */}
                  <div className="pt-10 px-5 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Ritam POS</div>
                      <div className="text-2xl font-bold text-gradient mt-1">₹0</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">commission today</div>
                    </div>

                    {/* Mock Order Items */}
                    <div className="space-y-3 flex-1">
                      {[
                        { item: 'Butter Chicken', qty: 2, price: '₹480' },
                        { item: 'Naan', qty: 4, price: '₹120' },
                        { item: 'Dal Makhani', qty: 1, price: '₹295' },
                        { item: 'Gulab Jamun', qty: 2, price: '₹80' },
                      ].map((order, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border)/0.3)]">
                          <div>
                            <div className="text-sm font-medium">{order.item}</div>
                            <div className="text-xs text-[hsl(var(--muted-foreground))]">x{order.qty}</div>
                          </div>
                          <div className="text-sm font-semibold">{order.price}</div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="pt-3 border-t-2 border-[hsl(var(--primary))] flex items-center justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-lg text-gradient">₹975</span>
                    </div>

                    {/* Zero Commission Badge */}
                    <div className="mt-3 mb-4 bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.3)] rounded-lg px-3 py-2 text-center">
                      <span className="text-xs font-semibold text-[hsl(var(--success))]">
                        ✅ Zero Commission — ₹0 saved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
