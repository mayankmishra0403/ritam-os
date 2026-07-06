import { motion } from 'framer-motion';
import { ClipboardCheck, Settings, IndianRupee, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: ClipboardCheck,
    title: 'Register karo',
    description: 'Apna restaurant register karo 2 minute mein. Bas name, phone aur address chahiye.',
    color: 'from-[hsl(var(--primary))] to-[hsl(var(--secondary))]',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Setup karo',
    description: 'Menu, tables aur staff add karo 15 minute mein. Itna easy hai ki koi training nahi chahiye.',
    color: 'from-[hsl(var(--secondary))] to-[hsl(var(--primary))]',
  },
  {
    number: '03',
    icon: IndianRupee,
    title: 'Save karo',
    description: 'Billing start karo. Zero commission forever. Har transaction par 100% profit apna.',
    color: 'from-[hsl(var(--primary))] to-[hsl(var(--secondary))]',
  },
];

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export function HowItWorksSection({ onOpenContact }) {
  return (
    <section className="section-padding bg-[hsl(var(--muted)/0.3)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-gradient">3 simple steps</span> mein shuru karo
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Zyada paperwork nahi. Zyada time nahi. Bus settle ho jao aur badhao.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-1/4 left-[20%] right-[20%] h-0.5 bg-[hsl(var(--border))] -translate-y-1/2">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-full bg-[hsl(var(--primary))] origin-left"
              style={{ transformOrigin: 'left' }}
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center space-y-6"
            >
              {/* Step Number */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--secondary)/0.1)] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--primary))] flex items-center justify-center">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {step.title}
                </h3>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>

              {/* Arrow (mobile) */}
              {index < steps.length - 1 && (
                <div className="md:hidden">
                  <ArrowRight className="w-6 h-6 text-[hsl(var(--primary))] rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
