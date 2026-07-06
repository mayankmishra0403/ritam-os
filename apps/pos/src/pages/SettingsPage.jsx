import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Percent,
  Printer,
  Users,
  Globe,
  Crown,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  Phone,
  MapPin,
  Shield,
  TestTube,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mockStaff } from '../data/mockData';

// ─── Settings Section Card ───
function SectionCard({ icon: Icon, title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-[#F0E6DC] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#FFF8F0] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
            <Icon size={20} className="text-[#FF6B35]" />
          </div>
          <span className="text-base font-semibold text-[#1A1A2E]">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-[#6B7280]" />
        ) : (
          <ChevronDown size={20} className="text-[#6B7280]" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#F0E6DC] pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Add Staff Modal ───
function AddStaffModal({ onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('WAITER');
  const [pin, setPin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !pin.trim()) {
      toast.error('All fields are required');
      return;
    }
    toast.success('Staff member added');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1A1A2E]">Add Staff Member</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#FFF8F0]">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              placeholder="Staff name"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              placeholder="9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 bg-white"
            >
              <option value="MANAGER">Manager</option>
              <option value="WAITER">Waiter</option>
              <option value="CASHIER">Cashier</option>
              <option value="KITCHEN">Kitchen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">PIN (4 digits)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              placeholder="****"
              maxLength={4}
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#F0E6DC] text-sm font-medium hover:bg-[#FFF8F0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#E85D04] transition-colors"
          >
            Add Staff
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

// ─── Main SettingsPage ───
export default function SettingsPage() {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [swiggyEnabled, setSwiggyEnabled] = useState(false);
  const [zomatoEnabled, setZomatoEnabled] = useState(false);

  // Outlet info state
  const [outletInfo, setOutletInfo] = useState({
    name: 'Main Outlet',
    address: 'Connaught Place, New Delhi - 110001',
    gstin: '07ABCDE1234F1Z5',
    fssai: '12345678901234',
    phone: '+91 9876543210',
  });

  // Tax state
  const [taxSettings, setTaxSettings] = useState({
    cgst: 5,
    sgst: 5,
    serviceCharge: 0,
  });

  // Printer state
  const [printers] = useState([
    { id: 'pr-1', name: 'Kitchen Printer', ip: '192.168.1.100', port: '9100', isDefault: true },
    { id: 'pr-2', name: 'Counter Printer', ip: '192.168.1.101', port: '9100', isDefault: false },
  ]);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Settings</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Manage your restaurant configuration
          </p>
        </div>
        <button
          onClick={() => toast.success('Settings saved')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06D6A0] text-white text-sm font-semibold hover:bg-[#05C090] transition-all shadow-sm"
        >
          <Save size={18} />
          Save All
        </button>
      </div>

      <div className="space-y-4 max-w-3xl">
        {/* ── Outlet Info ── */}
        <SectionCard icon={Store} title="Outlet Information" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Outlet Name</label>
              <input
                type="text"
                value={outletInfo.name}
                onChange={(e) => setOutletInfo({ ...outletInfo, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Phone</label>
              <input
                type="text"
                value={outletInfo.phone}
                onChange={(e) => setOutletInfo({ ...outletInfo, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Address</label>
              <input
                type="text"
                value={outletInfo.address}
                onChange={(e) => setOutletInfo({ ...outletInfo, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">GSTIN</label>
              <input
                type="text"
                value={outletInfo.gstin}
                onChange={(e) => setOutletInfo({ ...outletInfo, gstin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">FSSAI</label>
              <input
                type="text"
                value={outletInfo.fssai}
                onChange={(e) => setOutletInfo({ ...outletInfo, fssai: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Tax Settings ── */}
        <SectionCard icon={Percent} title="Tax Settings">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">CGST (%)</label>
              <input
                type="number"
                value={taxSettings.cgst}
                onChange={(e) => setTaxSettings({ ...taxSettings, cgst: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">SGST (%)</label>
              <input
                type="number"
                value={taxSettings.sgst}
                onChange={(e) => setTaxSettings({ ...taxSettings, sgst: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">Service Charge (%)</label>
              <input
                type="number"
                value={taxSettings.serviceCharge}
                onChange={(e) => setTaxSettings({ ...taxSettings, serviceCharge: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                min={0}
                max={100}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Printer Config ── */}
        <SectionCard icon={Printer} title="Printer Configuration">
          <div className="space-y-3">
            {printers.map((printer) => (
              <div
                key={printer.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#F0E6DC]"
              >
                <div className="flex items-center gap-3">
                  <Printer size={20} className="text-[#6B7280]" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">{printer.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {printer.ip}:{printer.port}
                    </p>
                  </div>
                  {printer.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[10px] font-medium text-[#FF6B35]">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success('Test page printed')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#F0E6DC] text-xs font-medium hover:bg-[#FFF8F0] transition-colors"
                  >
                    <TestTube size={14} />
                    Test
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-[#FFF8F0] text-[#6B7280]">
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button className="flex items-center gap-2 text-sm text-[#FF6B35] font-medium hover:text-[#E85D04] transition-colors">
              <Plus size={16} />
              Add Printer
            </button>
          </div>
        </SectionCard>

        {/* ── Staff Management ── */}
        <SectionCard icon={Users} title="Staff Management">
          <div className="space-y-3">
            {mockStaff.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#F0E6DC]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                    <Users size={16} className="text-[#FF6B35]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">{staff.name}</p>
                    <p className="text-xs text-[#6B7280]">{staff.phone} · {staff.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[#FFF8F0] text-[#6B7280]">
                    <Edit3 size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowAddStaff(true)}
              className="flex items-center gap-2 text-sm text-[#FF6B35] font-medium hover:text-[#E85D04] transition-colors"
            >
              <Plus size={16} />
              Add Staff Member
            </button>
          </div>
        </SectionCard>

        {/* ── Aggregator Integration ── */}
        <SectionCard icon={Globe} title="Aggregator Integration">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#F0E6DC]">
              <div>
                <p className="text-sm font-medium text-[#1A1A2E]">Swiggy</p>
                <p className="text-xs text-[#6B7280]">Receive orders from Swiggy</p>
              </div>
              <button
                onClick={() => setSwiggyEnabled(!swiggyEnabled)}
                className={`p-1 rounded-lg transition-colors ${
                  swiggyEnabled ? 'text-[#06D6A0]' : 'text-[#6B7280]'
                }`}
              >
                {swiggyEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#F0E6DC]">
              <div>
                <p className="text-sm font-medium text-[#1A1A2E]">Zomato</p>
                <p className="text-xs text-[#6B7280]">Receive orders from Zomato</p>
              </div>
              <button
                onClick={() => setZomatoEnabled(!zomatoEnabled)}
                className={`p-1 rounded-lg transition-colors ${
                  zomatoEnabled ? 'text-[#06D6A0]' : 'text-[#6B7280]'
                }`}
              >
                {zomatoEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
            {(swiggyEnabled || zomatoEnabled) && (
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">API Key</label>
                <input
                  type="password"
                  placeholder="Enter aggregator API key"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                />
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Subscription ── */}
        <SectionCard icon={Crown} title="Subscription & Plan">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF6B35]/10 to-[#E85D04]/10 border border-[#FF6B35]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1A1A2E]">Current Plan</span>
                <span className="px-3 py-1 rounded-full bg-[#06D6A0]/15 text-[#06D6A0] text-xs font-semibold">
                  Active
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1A1A2E]">Ritam Pro</p>
              <p className="text-sm text-[#6B7280] mt-1">
                ₹2,999/month · Billed annually · Renews on Aug 6, 2026
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">Orders this month</span>
                  <span className="font-medium">847 / 2000</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0E6DC] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E85D04]"
                    style={{ width: '42%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">Staff accounts</span>
                  <span className="font-medium">4 / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0E6DC] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#06D6A0] to-[#05C090]"
                    style={{ width: '40%' }}
                  />
                </div>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-[#1A1A2E] text-white text-sm font-semibold hover:bg-[#2A2A3E] transition-colors">
              Upgrade Plan
            </button>
          </div>
        </SectionCard>
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} />}
      </AnimatePresence>
    </div>
  );
}
