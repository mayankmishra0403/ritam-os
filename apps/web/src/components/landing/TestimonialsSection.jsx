import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: 'Petpooja ka commission 2% tha. Ritam ke saath ₹0. Mahina ₹12,000 bach rahe hain.',
    quoteEn: 'Petpooja charged 2% commission. With Ritam it\'s ₹0. Saving ₹12,000 every month.',
    name: 'Rajesh Sharma',
    restaurant: 'Sharma Dhaba',
    city: 'Delhi',
    rating: 5,
    image: '👨‍🍳',
  },
  {
    quote: 'Waiter ko English nahi aati. Par Ritam Hindi mein order leta hai. Game changer.',
    quoteEn: 'My waiter doesn\'t know English. But Ritam takes orders in Hindi. Game changer.',
    name: 'Priya Patel',
    restaurant: 'Patel\'s Kitchen',
    city: 'Ahmedabad',
    rating: 5,
    image: '👩‍🍳',
  },
  {
    quote: 'Offline mode mein bhi bill banate hain. Internet aate hi sab sync. Koi tension nahi.',
    quoteEn: 'We bill in offline mode too. Everything syncs when internet is back. No tension.',
    name: 'Amit Verma',
    restaurant: 'Verma Sweets & Fast Food',
    city: 'Lucknow',
    rating: 5,
    image: '👨‍🍳',
  },
  {
    quote: 'QR ordering ne table turnover time 15 min kam kar diya. Staff bhi khush, customer bhi khush.',
    quoteEn: 'QR ordering reduced table turnover by 15 min. Staff happy, customers happy.',
    name: 'Sneha Reddy',
    restaurant: 'Reddy\'s Biryani House',
    city: 'Hyderabad',
    rating: 5,
    image: '👩‍🍳',
  },
];

const quoteVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

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
            Restaurant walon ne kya kahaa?
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Suna nahi, khud dekho — Ritam use karne wale restaurant owners ki kahani.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Quote Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={quoteVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="glass-card p-8 md:p-12 text-center space-y-6"
              >
                <Quote className="w-10 h-10 mx-auto text-[hsl(var(--primary)/0.3)]" />

                {/* Hindi Quote */}
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-[hsl(var(--foreground))]">
                  "{testimonials[current].quote}"
                </p>

                {/* English translation */}
                <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
                  "{testimonials[current].quoteEn}"
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-1">
                  {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[hsl(var(--primary))] text-[hsl(var(--primary))]" />
                  ))}
                </div>

                {/* Author */}
                <div className="space-y-1">
                  <div className="text-3xl">{testimonials[current].image}</div>
                  <div className="font-bold text-lg">{testimonials[current].name}</div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    {testimonials[current].restaurant}, {testimonials[current].city}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prev}
              className="absolute top-1/2 -left-4 md:-left-6 -translate-y-1/2 w-12 h-12 rounded-full glass-card flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-all z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 -right-4 md:-right-6 -translate-y-1/2 w-12 h-12 rounded-full glass-card flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-all z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'bg-[hsl(var(--primary))] w-8'
                    : 'bg-[hsl(var(--border))] hover:bg-[hsl(var(--muted-foreground))]'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
