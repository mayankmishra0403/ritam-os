/**
 * Bluetooth Printer Service
 * 
 * Handles Web Bluetooth connections to ESC/POS thermal printers.
 * Works with Bluetooth-enabled receipt printers.
 * 
 * Browser support: Chrome 56+, Edge 79+, Opera 43+, Samsung Internet 6+
 * Note: Web Bluetooth requires HTTPS or localhost.
 * 
 * Common BLE printer service UUIDs:
 * - 000018f0-0000-1000-8000-00805f9b34fb (Generic printer)
 * - 0000ae30-0000-1000-8000-00805f9b34fb (Miji)
 * - 0000ff00-0000-1000-8000-00805f9b34fb (Zjiang)
 * 
 * Usage:
 *   const printer = new BluetoothPrinter();
 *   await printer.connect();
 *   await printer.print(byteArray);
 *   await printer.disconnect();
 */

// Common BLE service UUIDs for thermal printers
const PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ae30-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '00001800-0000-1000-8000-00805f9b34fb',
];

// Common BLE characteristic UUIDs for writing
const PRINTER_CHAR_UUIDS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '0000ae01-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '000018f1-0000-1000-8000-00805f9b34fb',
];

export class BluetoothPrinter {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.maxChunkSize = 182; // Default MTU - 3 bytes overhead
  }

  /**
   * Check if Web Bluetooth is supported in this browser
   * @returns {boolean}
   */
  static isSupported() {
    return 'bluetooth' in navigator;
  }

  /**
   * Request a Bluetooth printer device from the user
   * @param {Object} [options] - Optional filters
   * @param {Array<string>} [options.optionalServices] - Additional service UUIDs
   * @returns {Promise<BluetoothDevice>}
   */
  async requestDevice(options = {}) {
    if (!BluetoothPrinter.isSupported()) {
      throw new Error('Bluetooth is not supported in this browser. Use Chrome with HTTPS.');
    }

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        ...PRINTER_SERVICE_UUIDS,
        ...(options.optionalServices || []),
      ],
    });

    return device;
  }

  /**
   * Connect to a Bluetooth printer
   * @param {BluetoothDevice} [device] - Pre-selected device (will prompt if not)
   * @returns {Promise<boolean>}
   */
  async connect(device) {
    try {
      if (!BluetoothPrinter.isSupported()) {
        throw new Error('Bluetooth not supported');
      }

      // If no device provided, request one
      this.device = device || await this.requestDevice();

      if (!this.device) {
        throw new Error('No device selected');
      }

      // Connect to GATT server
      this.server = await this.device.gatt.connect();

      // Try to find the printer service and characteristic
      await this._findPrinterService();

      if (!this.characteristic) {
        throw new Error('Could not find printer characteristic on this device');
      }

      // Try to negotiate a larger MTU for faster printing
      try {
        const mtu = await this.server.getPrimaryService(
          PRINTER_SERVICE_UUIDS[0]
        );
        // Modern Chrome negotiates MTU automatically
      } catch (e) {
        // Ignore MTU negotiation errors
      }

      // Handle disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('Bluetooth printer disconnected');
        this._cleanup();
      });

      return true;
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      this._cleanup();
      throw error;
    }
  }

  /**
   * Find the printer service and write characteristic
   * @private
   */
  async _findPrinterService() {
    if (!this.server) throw new Error('Not connected to GATT server');

    for (const serviceUuid of PRINTER_SERVICE_UUIDS) {
      try {
        this.service = await this.server.getPrimaryService(serviceUuid);
        
        // Try to find a writable characteristic
        for (const charUuid of PRINTER_CHAR_UUIDS) {
          try {
            this.characteristic = await this.service.getCharacteristic(charUuid);
            
            // Check if the characteristic supports write
            if (this.characteristic.properties.write ||
                this.characteristic.properties.writeWithoutResponse) {
              return true;
            }
          } catch (e) {
            // Characteristic not found, try next one
            continue;
          }
        }

        // If no characteristic found via known UUIDs, enumerate all
        const characteristics = await this.service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            this.characteristic = char;
            return true;
          }
        }
      } catch (e) {
        // Service not found, try next
        continue;
      }
    }

    throw new Error('No suitable printer service/characteristic found');
  }

  /**
   * Print data to the Bluetooth printer
   * Sends data in chunks respecting BLE MTU limits.
   * @param {Uint8Array|Array<number>} data - ESC/POS byte array
   * @returns {Promise<void>}
   */
  async print(data) {
    if (!this.characteristic) {
      throw new Error('Printer not connected. Call connect() first.');
    }

    const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
    const totalLength = uint8Data.length;
    let offset = 0;

    // Send data in chunks (some printers have small MTU)
    while (offset < totalLength) {
      const chunkSize = Math.min(this.maxChunkSize, totalLength - offset);
      const chunk = uint8Data.slice(offset, offset + chunkSize);
      
      await this.characteristic.writeValue(chunk);
      offset += chunkSize;

      // Small delay between chunks to prevent printer buffer overflow
      if (offset < totalLength) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }
  }

  /**
   * Print with progress callback
   * @param {Uint8Array} data - ESC/POS byte array
   * @param {Function} [onProgress] - Callback with progress percentage
   * @returns {Promise<void>}
   */
  async printWithProgress(data, onProgress) {
    const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
    const totalSize = uint8Data.length;
    let offset = 0;

    while (offset < totalSize) {
      const chunkSize = Math.min(this.maxChunkSize, totalSize - offset);
      const chunk = uint8Data.slice(offset, offset + chunkSize);
      
      await this.characteristic.writeValue(chunk);
      offset += chunkSize;

      if (onProgress) {
        onProgress(Math.min(100, Math.round((offset / totalSize) * 100)));
      }

      if (offset < totalSize) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }
  }

  /**
   * Disconnect from the Bluetooth printer
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.device && this.device.gatt.connected) {
        this.device.removeEventListener('gattserverdisconnected', this._cleanup);
        this.device.gatt.disconnect();
      }
    } catch (error) {
      console.error('Bluetooth disconnect error:', error);
    } finally {
      this._cleanup();
    }
  }

  /**
   * Clean up internal state
   * @private
   */
  _cleanup() {
    this.server = null;
    this.service = null;
    this.characteristic = null;
  }

  /**
   * Get the device info
   * @returns {Object|null}
   */
  getDeviceInfo() {
    if (!this.device) return null;

    return {
      name: this.device.name || 'Unknown',
      id: this.device.id,
      connected: this.device.gatt?.connected || false,
    };
  }

  /**
   * Check if currently connected
   * @returns {boolean}
   */
  isConnected() {
    return !!(this.device && this.device.gatt?.connected);
  }

  /**
   * Scan for available Bluetooth printers (not directly feasible with Web Bluetooth API
   * since we can't list devices without user interaction).
   * This method prompts the user to select a device.
   * @param {number} [timeout=30000] - Scan timeout in ms
   * @returns {Promise<BluetoothDevice>}
   */
  async scan(timeout = 30000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICE_UUIDS,
        signal: controller.signal,
      });
      return device;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Check if Bluetooth is available
 * @returns {boolean}
 */
export function isBluetoothSupported() {
  return BluetoothPrinter.isSupported();
}

export default BluetoothPrinter;
