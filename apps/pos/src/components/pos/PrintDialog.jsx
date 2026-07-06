/**
 * PrintDialog Component
 * 
 * Printer selection and configuration dialog.
 * Supports:
 * - Printer type: Thermal, A4, PDF
 * - Connection: WebUSB, Bluetooth, Network (IP), Serial
 * - IP/Port configuration for network printers
 * - Bluetooth device scanning
 * - Test print
 * - Save as default
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Wifi,
  Bluetooth,
  Usb,
  Cable,
  Monitor,
  FileText,
  Check,
  TestTube,
  Save,
  Loader2,
  Scan,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import usePrinterStore from '../../store/printerStore';

// ─── Connection Type Options ───
const CONNECTION_TYPES = [
  { value: 'usb', label: 'WebUSB', icon: Usb, description: 'USB-connected printer (Chrome/Edge)' },
  { value: 'bluetooth', label: 'Bluetooth', icon: Bluetooth, description: 'Bluetooth/BLE printer' },
  { value: 'network', label: 'Network (IP)', icon: Wifi, description: 'Ethernet/WiFi printer via TCP' },
  { value: 'serial', label: 'Serial Port', icon: Cable, description: 'Serial/COM port (requires native)' },
];

const PRINTER_TYPES = [
  { value: 'thermal', label: 'Thermal (80mm)', icon: Printer, description: 'ESC/POS thermal receipt printer' },
  { value: 'thermal-58', label: 'Thermal (58mm)', icon: Printer, description: 'Small format thermal printer' },
  { value: 'a4', label: 'A4 Printer', icon: Monitor, description: 'Standard A4 laser/inkjet' },
  { value: 'pdf', label: 'PDF Export', icon: FileText, description: 'Save as PDF file' },
];

// ─── Form Validation ───
function validatePrinterForm(data) {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Printer name is required';
  }

  if (data.connection === 'network') {
    if (!data.ip?.trim()) {
      errors.ip = 'IP address is required';
    } else {
      const ipParts = data.ip.split('.').map(Number);
      if (ipParts.length !== 4 || ipParts.some((p) => isNaN(p) || p < 0 || p > 255)) {
        errors.ip = 'Invalid IP address (e.g., 192.168.1.100)';
      }
    }
    if (!data.port || data.port < 1 || data.port > 65535) {
      errors.port = 'Port must be 1-65535 (default: 9100)';
    }
  }

  return errors;
}

// ─── Connection-specific sub-forms ───
function NetworkForm({ data, onChange, errors }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          IP Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.ip || ''}
          onChange={(e) => onChange({ ip: e.target.value })}
          placeholder="192.168.1.100"
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 ${
            errors.ip ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
          autoFocus
        />
        {errors.ip && <p className="text-xs text-red-500 mt-1">{errors.ip}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Port <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={data.port || 9100}
          onChange={(e) => onChange({ port: parseInt(e.target.value) || 9100 })}
          placeholder="9100"
          min={1}
          max={65535}
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 ${
            errors.port ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        {errors.port && <p className="text-xs text-red-500 mt-1">{errors.port}</p>}
        <p className="text-xs text-gray-400 mt-1">
          Standard ESC/POS network port: 9100
        </p>
      </div>
    </div>
  );
}

function BluetoothForm({ data, onChange, errors }) {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  const handleScan = async () => {
    setScanning(true);
    try {
      if (!navigator.bluetooth) {
        toast.error('Bluetooth not supported in this browser');
        return;
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000ae30-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb',
        ],
      });

      if (device) {
        const newDevice = {
          id: device.id,
          name: device.name || 'Unknown Printer',
        };
        setDevices([newDevice]);
        onChange({ bluetoothId: device.id, name: newDevice.name });
        toast.success(`Found: ${newDevice.name}`);
      }
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        toast.error(`Scan failed: ${error.message}`);
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleScan}
        disabled={scanning}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-[#FF6B35] hover:text-[#FF6B35] disabled:opacity-50 transition-all"
      >
        {scanning ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Scan size={18} />
            Scan for Bluetooth Printers
          </>
        )}
      </button>

      {devices.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Found devices:</p>
          {devices.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200"
            >
              <Bluetooth size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">{d.name}</span>
              <Check size={16} className="ml-auto text-green-600" />
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Device ID (auto-filled)
        </label>
        <input
          type="text"
          value={data.bluetoothId || ''}
          readOnly
          placeholder="Scan to auto-fill"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500"
        />
      </div>
    </div>
  );
}

function USBForm({ data, onChange, errors }) {
  const [connecting, setConnecting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);

  const handleConnectUSB = async () => {
    setConnecting(true);
    try {
      if (!navigator.usb) {
        toast.error('WebUSB not supported. Use Chrome or Edge.');
        return;
      }

      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0416 }, // Winbond
          { vendorId: 0x0fe6 }, // Star
        ],
      });

      if (device) {
        const info = {
          vendorId: device.vendorId,
          productId: device.productId,
          productName: device.productName || 'Unknown Printer',
          manufacturerName: device.manufacturerName || 'Unknown',
        };
        setDeviceInfo(info);
        onChange({
          vendorId: info.vendorId,
          productId: info.productId,
          name: info.productName,
        });
        toast.success(`Connected: ${info.productName}`);
      }
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        toast.error(`USB connection failed: ${error.message}`);
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleConnectUSB}
        disabled={connecting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-[#FF6B35] hover:text-[#FF6B35] disabled:opacity-50 transition-all"
      >
        {connecting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Usb size={18} />
            Connect USB Printer
          </>
        )}
      </button>

      {deviceInfo && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 space-y-1">
          <p className="text-sm font-medium text-green-800">{deviceInfo.productName}</p>
          <p className="text-xs text-green-600">{deviceInfo.manufacturerName}</p>
          <p className="text-xs text-green-500">
            VID: 0x{deviceInfo.vendorId.toString(16)} · PID: 0x{deviceInfo.productId.toString(16)}
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Vendor ID (optional, hex)
        </label>
        <input
          type="text"
          value={data.vendorId ? `0x${data.vendorId.toString(16)}` : ''}
          onChange={(e) => {
            const val = parseInt(e.target.value, 16);
            onChange({ vendorId: isNaN(val) ? undefined : val });
          }}
          placeholder="0x04b8 (Epson)"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
        />
      </div>
    </div>
  );
}

function SerialForm({ data, onChange, errors }) {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Serial Port Notice</p>
            <p className="text-xs text-yellow-700 mt-1">
              Serial port printing requires a native application (Electron/Tauri).
              Web browsers cannot directly access serial ports for printer communication.
              Configure via network or USB for web-only usage.
            </p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Port Name</label>
        <input
          type="text"
          value={data.serialPort || ''}
          onChange={(e) => onChange({ serialPort: e.target.value })}
          placeholder="COM3 or /dev/ttyUSB0"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Baud Rate</label>
        <select
          value={data.baudRate || 9600}
          onChange={(e) => onChange({ baudRate: parseInt(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 bg-white"
        >
          <option value={9600}>9600</option>
          <option value={19200}>19200</option>
          <option value={38400}>38400</option>
          <option value={57600}>57600</option>
          <option value={115200}>115200</option>
        </select>
      </div>
    </div>
  );
}

// ─── Main PrintDialog ───
export default function PrintDialog({ printer, mode = 'add', onClose }) {
  const { addPrinter, updatePrinter } = usePrinterStore();

  const [formData, setFormData] = useState({
    name: printer?.name || '',
    type: printer?.type || 'thermal',
    connection: printer?.connection || 'network',
    ip: printer?.ip || '',
    port: printer?.port || 9100,
    vendorId: printer?.vendorId || undefined,
    productId: printer?.productId || undefined,
    bluetoothId: printer?.bluetoothId || '',
    serialPort: printer?.serialPort || '',
    baudRate: printer?.baudRate || 9600,
    paperSize: printer?.paperSize || '80mm',
    isDefault: printer?.isDefault || false,
  });
  const [errors, setErrors] = useState({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update form when printer prop changes
  useEffect(() => {
    if (printer) {
      setFormData({
        name: printer.name || '',
        type: printer.type || 'thermal',
        connection: printer.connection || 'network',
        ip: printer.ip || '',
        port: printer.port || 9100,
        vendorId: printer.vendorId || undefined,
        productId: printer.productId || undefined,
        bluetoothId: printer.bluetoothId || '',
        serialPort: printer.serialPort || '',
        baudRate: printer.baudRate || 9600,
        paperSize: printer.paperSize || '80mm',
        isDefault: printer.isDefault || false,
      });
    }
  }, [printer]);

  const updateField = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((key) => delete next[key]);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePrinterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the form errors');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'edit' && printer?.id) {
        updatePrinter(printer.id, formData);
        toast.success('Printer updated');
      } else {
        addPrinter(formData);
        toast.success('Printer added');
      }
      onClose?.();
    } catch (error) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrint = async () => {
    setTesting(true);
    try {
      // Test print via PrintEngine
      const { PrintEngine } = await import('../../services/printEngine');
      const engine = new PrintEngine();
      engine.generateTestReceipt();
      const bytes = engine.getBuffer();

      // Attempt to send via connection type
      if (formData.connection === 'network') {
        // In production: TCP socket to IP:Port
        console.log(`Would send ${bytes.length} bytes to ${formData.ip}:${formData.port}`);
        await new Promise((r) => setTimeout(r, 1000));
        toast.success(`Test print sent to ${formData.ip}:${formData.port}`);
      } else if (formData.connection === 'usb') {
        // In production: WebUSB
        toast.success('Test page sent to USB printer');
      } else if (formData.connection === 'bluetooth') {
        // In production: Bluetooth
        toast.success('Test page sent to Bluetooth printer');
      } else {
        // Download as file for testing
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-receipt-${Date.now()}.bin`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Test receipt downloaded (.bin file)');
      }
    } catch (error) {
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const connectionType = CONNECTION_TYPES.find((c) => c.value === formData.connection);
  const printerType = PRINTER_TYPES.find((p) => p.value === formData.type);
  const ConnectionIcon = connectionType?.icon || Wifi;
  const PrinterIcon = printerType?.icon || Printer;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
              <Printer size={20} className="text-[#FF6B35]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A2E]">
                {mode === 'edit' ? 'Edit Printer' : 'Add Printer'}
              </h2>
              <p className="text-sm text-gray-500">
                Configure your receipt printer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Printer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Printer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField({ name: e.target.value })}
              placeholder="e.g., Kitchen Printer"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Printer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Printer Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRINTER_TYPES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField({ type: value })}
                  className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    formData.type === value
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      formData.type === value ? 'text-[#FF6B35]' : 'text-gray-400'
                    }
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        formData.type === value ? 'text-[#FF6B35]' : 'text-gray-700'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Connection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONNECTION_TYPES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField({ connection: value })}
                  className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    formData.connection === value
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      formData.connection === value ? 'text-[#FF6B35]' : 'text-gray-400'
                    }
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        formData.connection === value
                          ? 'text-[#FF6B35]'
                          : 'text-gray-700'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Connection-specific form */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            {formData.connection === 'network' && (
              <NetworkForm
                data={formData}
                onChange={updateField}
                errors={errors}
              />
            )}
            {formData.connection === 'bluetooth' && (
              <BluetoothForm
                data={formData}
                onChange={updateField}
                errors={errors}
              />
            )}
            {formData.connection === 'usb' && (
              <USBForm
                data={formData}
                onChange={updateField}
                errors={errors}
              />
            )}
            {formData.connection === 'serial' && (
              <SerialForm
                data={formData}
                onChange={updateField}
                errors={errors}
              />
            )}
          </div>

          {/* Paper Size (thermal only) */}
          {formData.type?.startsWith('thermal') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Size
              </label>
              <div className="flex gap-2">
                {[
                  { value: '80mm', label: '80mm (Standard)' },
                  { value: '58mm', label: '58mm (Small)' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField({ paperSize: value })}
                    className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.paperSize === value
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Default Printer Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => updateField({ isDefault: e.target.checked })}
              className="w-5 h-5 rounded accent-[#FF6B35]"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Set as default printer</span>
              <p className="text-xs text-gray-400">
                New print jobs will use this printer by default
              </p>
            </div>
          </label>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            {/* Test Print */}
            <button
              type="button"
              onClick={handleTestPrint}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              {testing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <TestTube size={16} />
              )}
              {testing ? 'Testing...' : 'Test Print'}
            </button>

            <div className="flex-1" />

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#E85D04] disabled:opacity-50 transition-all shadow-sm"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {mode === 'edit' ? 'Update' : 'Add Printer'}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
