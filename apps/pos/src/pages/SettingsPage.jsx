import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Percent,
  Printer,
  Users,
  Globe,
  Crown,
  Mic,
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
  Check,
  Star,
  Wifi,
  Bluetooth,
  Usb,
  Cable,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mockStaff } from '../data/mockData';
import usePrinterStore from '../store/printerStore';
import PrintDialog from '../components/pos/PrintDialog';
import {
  getVoiceSettings,
  setVoiceSettings,
  getSpeechRecognitionLang,
  LANGUAGE_OPTIONS,
} from '../services/voiceSettings';
import { VoiceService } from '../services/voiceService';
import { WhatsAppService } from '../services/whatsappService';

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

// ─── Connection icon helper ───
function ConnectionIcon({ type, className = '' }) {
  const props = { size: 16, className };
  switch (type) {
    case 'usb': return <Usb {...props} />;
    case 'bluetooth': return <Bluetooth {...props} />;
    case 'network': return <Wifi {...props} />;
    case 'serial': return <Cable {...props} />;
    default: return <Wifi {...props} />;
  }
}

function ConnectionLabel({ type }) {
  const labels = {
    usb: 'USB',
    bluetooth: 'Bluetooth',
    network: 'Network (IP)',
    serial: 'Serial',
  };
  return labels[type] || type;
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

// ─── Printer Card ───
function PrinterCard({ printer, onEdit, onDelete, onSetDefault, onTest }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-[#F0E6DC] hover:border-[#FF6B35]/30 transition-all">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          printer.isDefault
            ? 'bg-[#FF6B35]/15 text-[#FF6B35]'
            : printer.isActive
            ? 'bg-[#06D6A0]/10 text-[#06D6A0]'
            : 'bg-gray-100 text-gray-400'
        }`}>
          <ConnectionIcon type={printer.connection} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#1A1A2E] truncate">{printer.name}</p>
            {printer.isDefault && (
              <span className="px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[10px] font-medium text-[#FF6B35] shrink-0">
                Default
              </span>
            )}
            {!printer.isActive && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-500 shrink-0">
                Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
            <ConnectionLabel type={printer.connection} />
            {printer.ip && <span>· {printer.ip}:{printer.port}</span>}
            {printer.bluetoothId && <span>· BLE</span>}
            {printer.paperSize && <span>· {printer.paperSize}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        {!printer.isDefault && (
          <button
            onClick={() => onSetDefault(printer.id)}
            className="p-1.5 rounded-lg hover:bg-[#FFF8F0] text-[#6B7280] hover:text-[#FF6B35] transition-colors"
            title="Set as default"
          >
            <Star size={14} />
          </button>
        )}
        <button
          onClick={() => onTest(printer)}
          className="p-1.5 rounded-lg hover:bg-[#FFF8F0] text-[#6B7280] hover:text-[#06D6A0] transition-colors"
          title="Test print"
        >
          <TestTube size={14} />
        </button>
        <button
          onClick={() => onEdit(printer)}
          className="p-1.5 rounded-lg hover:bg-[#FFF8F0] text-[#6B7280] hover:text-[#E85D04] transition-colors"
          title="Edit"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={() => onDelete(printer.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Voice Settings Content ───
function VoiceSettingsContent() {
  const [settings, setSettings] = useState(getVoiceSettings());
  const [testText, setTestText] = useState('');
  const [testStatus, setTestStatus] = useState(null); // 'idle' | 'listening' | 'success' | 'error'
  const testVoiceRef = useRef(null);

  // Update local state and persist
  const updateSetting = (key, value) => {
    const updated = setVoiceSettings({ [key]: value });
    setSettings(updated);
  };

  // Handle sensitivity slider
  const handleSensitivityChange = (e) => {
    updateSetting('sensitivity', parseFloat(e.target.value));
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    updateSetting('language', e.target.value);
  };

  // ── Test Voice Button ──
  const handleTestVoice = () => {
    if (testStatus === 'listening') {
      // Stop listening
      if (testVoiceRef.current) {
        testVoiceRef.current.stop();
      }
      setTestStatus('idle');
      return;
    }

    const voice = new VoiceService();
    const recogLang = getSpeechRecognitionLang(settings.language || 'hi-IN');
    const ok = voice.init(recogLang);
    if (!ok) {
      setTestStatus('error');
      setTestText('Speech recognition not supported');
      return;
    }

    setTestText('');
    setTestStatus('listening');

    voice.onResult = ({ final, interim }) => {
      const text = final || interim;
      setTestText(text);

      if (final) {
        setTestStatus('success');
        voice.stop();
        toast.success(`Heard: "${text}"`);
      }
    };

    voice.onError = (error) => {
      setTestStatus('error');
      setTestText(`Error: ${error}`);
      toast.error(`Voice test error: ${error}`);
    };

    voice.onEnd = () => {
      if (testStatus === 'listening') {
        setTestStatus('idle');
      }
    };

    testVoiceRef.current = voice;
    voice.start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (testVoiceRef.current) {
        testVoiceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Enable / Disable */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-[#F0E6DC]">
        <div>
          <p className="text-sm font-medium text-[#1A1A2E]">Enable Voice Ordering</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Waiter can speak Hindi commands to add items
          </p>
        </div>
        <button
          onClick={() => updateSetting('enabled', !settings.enabled)}
          className={`p-1 rounded-lg transition-colors ${
            settings.enabled ? 'text-[#06D6A0]' : 'text-[#6B7280]'
          }`}
          aria-label="Toggle voice ordering"
        >
          {settings.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
        </button>
      </div>

      {/* Language selector */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Recognition Language
        </label>
        <select
          value={settings.language}
          onChange={handleLanguageChange}
          disabled={!settings.enabled}
          className="w-full px-4 py-2.5 rounded-xl border border-[#F0E6DC] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value + opt.short} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[#6B7280] mt-1.5">
          Hindi works best for menu items with Hindi names. Hinglish mode
          handles mixed Hindi-English speech.
        </p>
      </div>

      {/* Sensitivity slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[#6B7280]">
            Matching Sensitivity
          </label>
          <span className="text-sm font-semibold text-[#FF6B35]">
            {Math.round(settings.sensitivity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.4"
          max="0.95"
          step="0.05"
          value={settings.sensitivity}
          onChange={handleSensitivityChange}
          disabled={!settings.enabled}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#FF6B35] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #FF6B35 ${
              (settings.sensitivity - 0.4) / 0.55 * 100
            }%, #F0E6DC ${(settings.sensitivity - 0.4) / 0.55 * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#6B7280] mt-1">
          <span>Strict (40%)</span>
          <span>Balanced (70%)</span>
          <span>Loose (95%)</span>
        </div>
        <p className="text-xs text-[#6B7280] mt-1.5">
          Higher sensitivity means tighter matching (fewer false positives,
          but may miss variations). Lower sensitivity catches more accent
          variations.
        </p>
      </div>

      {/* Test Voice */}
      <div className="p-4 rounded-xl border border-[#F0E6DC] bg-[#FFF8F0]">
        <p className="text-sm font-medium text-[#1A1A2E] mb-2">
          Test Voice Recognition
        </p>
        <p className="text-xs text-[#6B7280] mb-3">
          Click "Try Speaking" and say a menu item like "पनीर टिक्का" or
          "बटर चिकन"
        </p>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleTestVoice}
            disabled={!settings.enabled}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              testStatus === 'listening'
                ? 'bg-red-500 text-white voice-pulse'
                : 'bg-[#FF6B35] text-white hover:bg-[#E85D04]'
            }`}
          >
            {testStatus === 'listening' ? (
              <>
                <MicOff size={16} />
                Stop Listening
              </>
            ) : (
              <>
                <Mic size={16} />
                Try Speaking
              </>
            )}
          </button>

          {testStatus === 'listening' && (
            <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening...
            </span>
          )}
        </div>

        {/* Transcript result */}
        {(testText || testStatus === 'error') && (
          <div
            className={`px-4 py-3 rounded-xl text-sm ${
              testStatus === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : testStatus === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-white border border-[#F0E6DC] text-[#1A1A2E]'
            }`}
          >
            <span className="font-medium">
              {testStatus === 'error' ? 'Error: ' : testStatus === 'success' ? '✅ ' : '🎤 '}
            </span>
            {testText || 'No speech detected'}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-[#6B7280]">Try saying:</span>
          {['पनीर टिक्का', 'बटर चिकन', 'दो नान', 'बिल', 'प्रिंट'].map((phrase) => (
            <button
              key={phrase}
              onClick={() => setTestText(phrase)}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#F0E6DC] text-xs text-[#6B7280] hover:border-[#FF6B35]/30 hover:text-[#FF6B35] transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F0E6DC]">
        <p className="text-xs font-medium text-[#6B7280]">
          ⌨️ Keyboard Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#F0E6DC] font-mono text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#F0E6DC] font-mono text-[11px]">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#F0E6DC] font-mono text-[11px]">V</kbd> to toggle voice
        </p>
      </div>
    </div>
  );
}

// ─── Main SettingsPage ───
export default function SettingsPage() {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [swiggyEnabled, setSwiggyEnabled] = useState(false);
  const [zomatoEnabled, setZomatoEnabled] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printDialogMode, setPrintDialogMode] = useState('add');
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [testingPrinterId, setTestingPrinterId] = useState(null);

  // Printer store
  const {
    printers,
    addPrinter,
    updatePrinter,
    removePrinter,
    setDefaultPrinter,
    togglePrinterActive,
  } = usePrinterStore();

  // WhatsApp state
  const [whatsappStatus, setWhatsappStatus] = useState({ connected: false, configured: false, sender: '' });
  const [whatsappChecking, setWhatsappChecking] = useState(true);
  const [whatsappTestPhone, setWhatsappTestPhone] = useState('');
  const [whatsappTesting, setWhatsappTesting] = useState(false);
  const [whatsappAutoConfirm, setWhatsappAutoConfirm] = useState(true);
  const [whatsappAutoReady, setWhatsappAutoReady] = useState(true);
  const [whatsappAutoReceipt, setWhatsappAutoReceipt] = useState(true);

  // Check WhatsApp connection on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await WhatsAppService.getStatus();
        if (!cancelled) setWhatsappStatus(status);
      } catch {
        if (!cancelled) setWhatsappStatus({ connected: false, configured: false });
      } finally {
        if (!cancelled) setWhatsappChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  // ── Printer Actions ──
  const handleAddPrinter = () => {
    setPrintDialogMode('add');
    setEditingPrinter(null);
    setShowPrintDialog(true);
  };

  const handleEditPrinter = (printer) => {
    setPrintDialogMode('edit');
    setEditingPrinter(printer);
    setShowPrintDialog(true);
  };

  const handleDeletePrinter = (id) => {
    const printer = printers.find((p) => p.id === id);
    if (printer?.isDefault) {
      toast.error('Cannot delete the default printer. Set another as default first.');
      return;
    }
    removePrinter(id);
    toast.success('Printer deleted');
  };

  const handleSetDefault = (id) => {
    setDefaultPrinter(id);
    toast.success('Default printer updated');
  };

  const handleTestPrint = async (printer) => {
    setTestingPrinterId(printer.id);
    try {
      const { PrintEngine } = await import('../services/printEngine');
      const engine = new PrintEngine();
      engine.generateTestReceipt();
      const bytes = engine.getBuffer();

      // Simulate sending to printer
      await new Promise((r) => setTimeout(r, 1000));
      
      // Download as bin for demo
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-${printer.name.replace(/\s+/g, '-')}-${Date.now()}.bin`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Test page sent to ${printer.name}`);
    } catch (error) {
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTestingPrinterId(null);
    }
  };

  const handleSavePrinter = (printerData) => {
    if (printDialogMode === 'edit' && editingPrinter) {
      updatePrinter(editingPrinter.id, printerData);
      toast.success('Printer updated');
    } else {
      addPrinter(printerData);
      toast.success('Printer added');
    }
    setShowPrintDialog(false);
    setEditingPrinter(null);
  };

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

        {/* ── Printer Configuration (Enhanced) ── */}
        <SectionCard icon={Printer} title="Printer Configuration" defaultOpen={true}>
          <div className="space-y-3">
            {/* Printer list */}
            {printers.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <Printer size={40} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium">No printers configured</p>
                <p className="text-sm mt-1">Add a printer to start printing receipts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {printers.map((printer) => (
                  <PrinterCard
                    key={printer.id}
                    printer={printer}
                    onEdit={handleEditPrinter}
                    onDelete={handleDeletePrinter}
                    onSetDefault={handleSetDefault}
                    onTest={handleTestPrint}
                  />
                ))}
              </div>
            )}

            {/* Add printer button */}
            <button
              onClick={handleAddPrinter}
              className="flex items-center gap-2 text-sm text-[#FF6B35] font-medium hover:text-[#E85D04] transition-colors py-2"
            >
              <Plus size={16} />
              Add Printer
            </button>

            {/* Printer tips */}
            <div className="mt-3 p-3 rounded-xl bg-[#FFF8F0] border border-[#F0E6DC]">
              <p className="text-xs font-medium text-[#6B7280] mb-1">Printer Setup Tips:</p>
              <ul className="text-xs text-[#6B7280] space-y-1 list-disc list-inside">
                <li>Use <strong>Network (IP)</strong> for Ethernet-connected thermal printers on port 9100</li>
                <li>Use <strong>WebUSB</strong> for USB printers (Chrome/Edge recommended)</li>
                <li>Use <strong>Bluetooth</strong> for wireless BLE thermal printers</li>
                <li>Set a <strong>default printer</strong> for automatic receipt printing</li>
                <li>Run a <strong>Test Print</strong> to verify connection before going live</li>
              </ul>
            </div>
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

        {/* ── Voice Settings ── */}
        <SectionCard icon={Mic} title="Voice Settings (Hindi)">
          <VoiceSettingsContent />
        </SectionCard>

        {/* ── WhatsApp Integration ── */}
        <SectionCard icon={MessageCircle} title="WhatsApp Integration" defaultOpen={true}>
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#F0E6DC]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  whatsappStatus.connected
                    ? 'bg-[#06D6A0]/10'
                    : 'bg-gray-100'
                }`}>
                  {whatsappChecking ? (
                    <Loader2 size={20} className="animate-spin text-[#6B7280]" />
                  ) : (
                    <MessageCircle size={20} className={
                      whatsappStatus.connected ? 'text-[#06D6A0]' : 'text-gray-400'
                    } />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E]">
                    {whatsappChecking
                      ? 'Checking connection...'
                      : whatsappStatus.connected
                        ? 'WhatsApp Connected'
                        : 'WhatsApp Configured'}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {whatsappChecking
                      ? ''
                      : whatsappStatus.connected
                        ? `Sender: ${whatsappStatus.sender || '919305804916'}`
                        : 'MSG91 API configured — ready to send'}
                  </p>
                </div>
              </div>
              {!whatsappChecking && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  whatsappStatus.connected
                    ? 'bg-[#06D6A0]/15 text-[#06D6A0]'
                    : 'bg-[#FF6B35]/15 text-[#FF6B35]'
                }`}>
                  {whatsappStatus.connected ? 'Connected' : 'Configured'}
                </span>
              )}
            </div>

            {/* Test WhatsApp */}
            <div className="p-4 rounded-xl bg-[#FFF8F0] border border-[#F0E6DC]">
              <p className="text-sm font-medium text-[#1A1A2E] mb-2">Test WhatsApp</p>
              <p className="text-xs text-[#6B7280] mb-3">
                Send a test message to verify the WhatsApp integration is working.
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={whatsappTestPhone}
                  onChange={(e) => setWhatsappTestPhone(e.target.value)}
                  placeholder="WhatsApp number (e.g. 9198XXXXXXXX)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#F0E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                />
                <button
                  onClick={async () => {
                    if (!whatsappTestPhone || whatsappTestPhone.length < 10) {
                      toast.error('Enter a valid WhatsApp number with country code');
                      return;
                    }
                    setWhatsappTesting(true);
                    try {
                      const result = await WhatsAppService.sendTest(whatsappTestPhone);
                      if (result.success) {
                        toast.success('Test message sent! Check your WhatsApp.');
                      } else {
                        toast.error(`Test failed: ${result.error || 'Unknown error'}`);
                      }
                    } catch (error) {
                      toast.error(`Test failed: ${error.message}`);
                    } finally {
                      setWhatsappTesting(false);
                    }
                  }}
                  disabled={whatsappTesting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06D6A0] text-white text-sm font-semibold hover:bg-[#05C090] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  {whatsappTesting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <TestTube size={16} />
                  )}
                  {whatsappTesting ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </div>

            {/* Auto-Send Toggles */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#1A1A2E]">Auto-Send Notifications</p>
              <p className="text-xs text-[#6B7280] mb-2">
                Automatically send WhatsApp messages when these events occur.
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#F0E6DC]">
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} className="text-[#FF6B35]" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">Order Confirmation</p>
                    <p className="text-xs text-[#6B7280]">Send when order is placed</p>
                  </div>
                </div>
                <button
                  onClick={() => setWhatsappAutoConfirm(!whatsappAutoConfirm)}
                  className={`p-1 rounded-lg transition-colors ${whatsappAutoConfirm ? 'text-[#06D6A0]' : 'text-[#6B7280]'}`}
                >
                  {whatsappAutoConfirm ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#F0E6DC]">
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} className="text-[#FF6B35]" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">Ready Notification</p>
                    <p className="text-xs text-[#6B7280]">Send when order is ready to serve</p>
                  </div>
                </div>
                <button
                  onClick={() => setWhatsappAutoReady(!whatsappAutoReady)}
                  className={`p-1 rounded-lg transition-colors ${whatsappAutoReady ? 'text-[#06D6A0]' : 'text-[#6B7280]'}`}
                >
                  {whatsappAutoReady ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#F0E6DC]">
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} className="text-[#FF6B35]" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">Payment Receipt</p>
                    <p className="text-xs text-[#6B7280]">Send after payment is completed</p>
                  </div>
                </div>
                <button
                  onClick={() => setWhatsappAutoReceipt(!whatsappAutoReceipt)}
                  className={`p-1 rounded-lg transition-colors ${whatsappAutoReceipt ? 'text-[#06D6A0]' : 'text-[#6B7280]'}`}
                >
                  {whatsappAutoReceipt ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>

            {/* Info note */}
            <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F0E6DC]">
              <p className="text-xs text-[#6B7280]">
                <strong>Note:</strong> WhatsApp messages are sent in Hindi + English mix.
                Customers receive order confirmations, ready notifications, and payment receipts
                on their registered WhatsApp number. MSG91 charges apply per message.
              </p>
            </div>
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

      {/* Print Dialog Modal */}
      <AnimatePresence>
        {showPrintDialog && (
          <PrintDialog
            printer={editingPrinter}
            mode={printDialogMode}
            onClose={() => {
              setShowPrintDialog(false);
              setEditingPrinter(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
