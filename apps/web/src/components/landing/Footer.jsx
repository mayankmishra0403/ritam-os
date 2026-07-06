import { motion } from 'framer-motion';
import { Mail, Instagram, MessageCircle, Youtube } from 'lucide-react';

const quickLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '#demo' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

const socialLinks = [
  { icon: Mail, href: 'mailto:hello@ritam.in', label: 'Email' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: MessageCircle, href: '#', label: 'WhatsApp' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer({ onOpenContact }) {
  const currentYear = new Date().getFullYear();

  const handleClick = (e, href) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer id="contact" className="bg-[hsl(var(--foreground))] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col">
              <span className="text-3xl font-bold font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                Ritam
              </span>
              <span className="text-sm text-[hsl(var(--primary))] tracking-widest">ऋतम्</span>
            </div>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              India's first zero-commission restaurant OS. 
              Offline-first, Hindi-speaking, WhatsApp-native.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Contact Us
            </h4>
            <a
              href="mailto:hello@ritam.in"
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              <Mail className="w-4 h-4" />
              hello@ritam.in
            </a>

            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(var(--primary))] transition-all duration-200"
                >
                  <social.icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>

            <p className="text-xs text-white/40 pt-2 leading-relaxed">
              Built for Indian restaurants.<br />
              With ❤️ from <strong className="text-white/60">Dehradun</strong> & <strong className="text-white/60">Lucknow</strong>.
            </p>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/10 mt-12 pt-8 text-center"
        >
          <p className="text-sm text-white/40">
            Ritam Bharat © {currentYear}. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
