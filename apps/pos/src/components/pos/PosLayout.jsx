import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3,
  Receipt,
  UtensilsCrossed,
  BarChart3,
  Settings,
  LogOut,
  Clock,
  Store,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Grid3x3, label: 'Table View', end: true },
  { to: '/orders', icon: Receipt, label: 'Orders' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="flex items-center gap-2 text-sm text-[#6B7280]">
      <Clock size={16} />
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

function DateDisplay() {
  const today = new Date();
  return (
    <span className="text-sm text-[#6B7280]">
      {today.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </span>
  );
}

export default function PosLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFF8F0]">
      {/* ── Sidebar ── */}
      <aside className="no-print flex w-64 flex-col bg-[#1A1A2E] text-white shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              Ritam
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] animate-pulse" />
          </div>
        </div>

        {/* Staff info */}
        <div className="px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
              <User size={18} className="text-[#FF6B35]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Rajesh</p>
              <p className="text-xs text-white/50 truncate">Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3 px-2">
            <Store size={14} className="text-white/50" />
            <span className="text-xs text-white/60 truncate">Main Outlet - Connaught Place</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <header className="no-print flex items-center justify-between px-6 py-3 bg-white border-b border-[#F0E6DC] shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[#1A1A2E]">
              Main Outlet
            </h2>
            <span className="text-sm text-[#6B7280] hidden md:inline">Connaught Place, New Delhi</span>
          </div>
          <div className="flex items-center gap-4">
            <DateDisplay />
            <ClockDisplay />
          </div>
        </header>

        {/* Page content with animations */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
