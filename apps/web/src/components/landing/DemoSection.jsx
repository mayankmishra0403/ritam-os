import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Phone, User, MapPin, Building2, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function DemoSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    restaurant: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.city || !formData.restaurant) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitted(true);
    toast.success('Demo request received! We\'ll call you within 24 hours.');
  };

  return (
    <section id="demo" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Book a <span className="text-gradient">Free Demo</span>
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            15 minute mein dikha denge kaise Ritam aapka restaurant badal dega. Free. No spam.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Video/Preview Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center group cursor-pointer"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="relative z-10 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <div className="text-white font-bold text-lg">Watch Ritam in Action</div>
              <div className="text-white/80 text-sm">2 min demo video</div>
            </div>

            {/* Decorative dots */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8"
          >
            {isSubmitted ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--success)/0.1)] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-[hsl(var(--success))]" />
                </div>
                <h3 className="text-2xl font-bold font-serif">Thank You! 🙏</h3>
                <p className="text-[hsl(var(--muted-foreground))]">
                  We've received your demo request. Our team will call you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', phone: '', city: '', restaurant: '' });
                  }}
                  className="text-sm text-[hsl(var(--primary))] hover:underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rajesh Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[hsl(var(--primary))]" />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Delhi, Lucknow, Mumbai..."
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    name="restaurant"
                    value={formData.restaurant}
                    onChange={handleChange}
                    placeholder="Sharma Dhaba"
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
                  />
                </div>

                <button type="submit" className="btn-primary w-full text-base">
                  <Send className="w-4 h-4" />
                  Book Free Demo
                </button>

                <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                  We'll call you within 24 hours. No spam, no sales pitch — just a live demo.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
