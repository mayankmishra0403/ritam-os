import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const competitors = ['Ritam OS', 'Petpooja', 'Zomato Base', 'DotPe'];

const rows = [
  { label: 'Pricing', ritam: '₹0 commission', others: '2-5% per transaction' },
  { label: 'Offline Mode', ritam: true, others: false },
  { label: 'Hindi UI', ritam: true, others: false },
  { label: 'Hindi Voice Input', ritam: true, others: false },
  { label: 'Kitchen Display', ritam: true, others: 'Paid addon' },
  { label: 'QR Self-Ordering', ritam: true, others: 'Paid addon' },
  { label: 'WhatsApp Integration', ritam: true, others: false },
  { label: 'Aggregator Integration', ritam: true, others: 'Limited' },
  { label: 'API Access', ritam: true, others: 'Enterprise only' },
];

export function ComparisonSection() {
  return (
    <section className="section-padding bg-[hsl(var(--muted)/0.3)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ritam vs. Baki sab
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Dekhiye kaun kitna paisa le raha hai aur kya de raha hai.
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <motion.table
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full min-w-[640px] border-collapse"
          >
            <thead>
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Features
                </th>
                {competitors.map((name) => (
                  <th
                    key={name}
                    className={`py-4 px-4 text-center font-bold text-sm ${
                      name === 'Ritam OS'
                        ? 'text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    {name === 'Ritam OS' ? (
                      <span className="flex flex-col items-center">
                        <span className="font-serif text-lg">Ritam</span>
                        <span className="text-xs text-[hsl(var(--primary))] font-normal">ऋतम्</span>
                      </span>
                    ) : (
                      name
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`border-t border-[hsl(var(--border)/0.5)] ${
                    idx % 2 === 0 ? 'bg-white/50' : ''
                  }`}
                >
                  <td className="py-4 px-4 font-medium text-sm">{row.label}</td>
                  <td
                    className={`py-4 px-4 text-center ${
                      row.label === 'Pricing'
                        ? 'font-semibold text-[hsl(var(--primary))]'
                        : ''
                    } ${
                      row.label === 'Pricing' &&
                      row.ritam === '₹0 commission'
                        ? 'bg-[hsl(var(--primary)/0.05)] rounded-l-lg'
                        : ''
                    }`}
                  >
                    {typeof row.ritam === 'boolean' ? (
                      row.ritam ? (
                        <Check className="w-5 h-5 mx-auto text-[hsl(var(--success))]" />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-[hsl(var(--destructive))]" />
                      )
                    ) : (
                      <span className="text-xs sm:text-sm">{row.ritam}</span>
                    )}
                  </td>
                  {[1, 2, 3].map((col) => (
                    <td key={col} className="py-4 px-4 text-center">
                      {typeof row.others === 'boolean' ? (
                        row.others ? (
                          <Check className="w-5 h-5 mx-auto text-[hsl(var(--success))]" />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-[hsl(var(--destructive))]" />
                        )
                      ) : (
                        <span className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                          {row.others}
                        </span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </div>
    </section>
  );
}
