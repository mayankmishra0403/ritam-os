import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wifi, Mic, MessageCircle, QrCode, IndianRupee, ChefHat } from 'lucide-react';

const features = [
  {
    icon: Wifi,
    title: 'Offline POS',
    description:
      'Without internet bhi bill banao. Data automatically sync hoga jab internet aaye.',
  },
  {
    icon: Mic,
    title: 'Hindi Voice Ordering',
    description:
      'Waiter directly Hindi mein bolega, system order lega. No typing needed.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp-native',
    description:
      'Customer ko order confirmation, bill aur feedback sab WhatsApp par.',
  },
  {
    icon: QrCode,
    title: 'QR Self-Ordering',
    description:
      'Table par QR code scan karo, customer khud order karega.',
  },
  {
    icon: IndianRupee,
    title: 'Zero Commission',
    description:
      'Har transaction par 0% fee. Sirf fixed monthly fee.',
  },
  {
    icon: ChefHat,
    title: 'Kitchen Display System',
    description:
      'Order directly kitchen screen par dikhe. KOT print nahi.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Indian restaurants ke liye
            <br />
            <span className="text-gradient">complete OS</span>
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Ek hi platform — billing se leke kitchen tak, sab kuch. No more multiple apps.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="glass-card-hover p-8 space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {feature.title}
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
