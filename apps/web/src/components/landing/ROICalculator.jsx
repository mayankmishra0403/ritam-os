import { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { IndianRupee, TrendingUp, Calculator, ArrowRight } from 'lucide-react';

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: 'easeOut',
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}₹{displayValue.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

export function ROICalculator() {
  const [monthlyOrders, setMonthlyOrders] = useState(600);
  const [avgOrderValue, setAvgOrderValue] = useState(350);

  const commissionRate = 0.02; // 2% typical commission
  const monthlySavings = monthlyOrders * avgOrderValue * commissionRate;
  const annualSavings = monthlySavings * 12;

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Calculate karo,
            <br />
            <span className="text-gradient">kitna bacha rahe ho</span>
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Petpooja, Zomato ya DotPe par 2% commission de rahe ho. Dekho kitna bach sakta hai.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Calculator Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-bold font-serif">Your Savings Calculator</h3>
            </div>

            {/* Monthly Orders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Monthly Orders</label>
                <span className="text-lg font-bold text-[hsl(var(--primary))]">
                  {monthlyOrders.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(16, 100%, 60%) 0%, hsl(16, 100%, 60%) ${
                    (monthlyOrders / 5000) * 100
                  }%, hsl(40, 20%, 88%) ${(monthlyOrders / 5000) * 100}%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>100</span>
                <span>5,000</span>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Avg Order Value (₹)</label>
                <span className="text-lg font-bold text-[hsl(var(--primary))]">
                  ₹{avgOrderValue}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={10}
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(16, 100%, 60%) 0%, hsl(16, 100%, 60%) ${
                    (avgOrderValue / 2000) * 100
                  }%, hsl(40, 20%, 88%) ${(avgOrderValue / 2000) * 100}%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>₹50</span>
                <span>₹2,000</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--success))]" />
                <span>
                  At 2% commission, you're paying{' '}
                  <strong className="text-[hsl(var(--foreground))]">
                    ₹{(monthlySavings).toLocaleString('en-IN')}
                  </strong>{' '}
                  per month to other platforms.
                </span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Monthly Savings */}
            <div className="glass-card p-8 text-center space-y-2">
              <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Monthly Savings with Ritam
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-gradient">
                <AnimatedNumber value={monthlySavings} prefix="₹" />
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                bach rahe hai abhi! 🎉
              </div>
            </div>

            {/* Annual Savings */}
            <div className="glass-card p-8 text-center space-y-2">
              <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Annual Savings
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-gradient">
                <AnimatedNumber value={annualSavings} prefix="₹" />
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                saal mein bachat — ek staff ki salary! 🚀
              </div>
            </div>

            <div className="bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] rounded-xl p-5 text-center">
              <p className="text-sm font-semibold text-[hsl(var(--success))]">
                Petpooja/Zomato par itna commission de rahe ho? Ritam ke saath ₹0 commission. 
                Yeh savings aapki profit hai.
              </p>
            </div>

            <div className="text-center">
              <a
                href="#demo"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector('#demo');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="btn-primary"
              >
                Abhi Start Karein <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
