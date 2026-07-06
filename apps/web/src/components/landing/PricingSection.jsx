import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Micro',
    tagline: 'Chai stall / small shop',
    price: { monthly: 0, annual: 0 },
    description: 'For the smallest chai stalls and street food vendors.',
    popular: false,
    features: [
      'Billing only',
      'Up to 50 orders/month',
      'Basic reports',
      'Single outlet',
      'Cash-only billing',
    ],
    cta: 'Free Forever',
  },
  {
    name: 'Starter',
    tagline: 'Small restaurant / dhaba',
    price: { monthly: 499, annual: 399 },
    description: 'For small restaurants starting their digitization journey.',
    popular: false,
    features: [
      'Offline POS',
      'WhatsApp billing',
      'Unlimited orders',
      '1 outlet',
      'Basic inventory',
      'Hindi UI',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Growth',
    tagline: 'Most Popular',
    price: { monthly: 999, annual: 799 },
    description: 'For growing restaurants with multiple service channels.',
    popular: true,
    features: [
      'Everything in Starter',
      'Kitchen Display System',
      'QR self-ordering',
      'Up to 3 outlets',
      'Advanced reports',
      'Staff management',
      'Hindi voice ordering',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro',
    tagline: 'For chains & enterprises',
    price: { monthly: 1999, annual: 1599 },
    description: 'For restaurant chains needing full control and integrations.',
    popular: false,
    features: [
      'Everything in Growth',
      'Unlimited outlets',
      'Aggregator integration',
      'Full API access',
      'Custom reports',
      'Dedicated support',
      'White-label option',
    ],
    cta: 'Contact Sales',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="section-padding bg-[hsl(var(--muted)/0.3)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            No commission. Sirf fixed fee.
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Jitna kamao utna apna. Koi percentage nahi katega.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                isAnnual ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]'
              }`}
              aria-label="Toggle annual pricing"
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
              Annual <span className="text-[hsl(var(--success))] text-xs font-semibold">Save 20%</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {plans.map((plan) => {
            const price = isAnnual ? plan.price.annual : plan.price.monthly;

            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                className={`relative glass-card-hover p-8 flex flex-col ${
                  plan.popular
                    ? 'border-2 border-[hsl(var(--primary))] shadow-glow scale-[1.02] lg:scale-105'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{plan.tagline}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">/mo</span>
                  </div>
                  {isAnnual && plan.price.annual > 0 && (
                    <div className="text-xs text-[hsl(var(--success))] font-medium mt-1">
                      ₹{plan.price.monthly}/mo billed annually — save 20%
                    </div>
                  )}
                  {price === 0 && (
                    <div className="text-xs text-[hsl(var(--success))] font-medium mt-1">
                      No payment needed
                    </div>
                  )}
                </div>

                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-[hsl(var(--primary))] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    const el = document.querySelector('#demo');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                    plan.popular
                      ? 'btn-primary'
                      : price === 0
                      ? 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.3)] hover:bg-[hsl(var(--success)/0.15)]'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
