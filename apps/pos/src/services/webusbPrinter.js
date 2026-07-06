/**
 * WebUSB Printer Service
 * 
 * Handles WebUSB connections to ESC/POS thermal printers.
 * Works with USB-connected Epson and compatible printers.
 * 
 * Browser support: Chrome 61+, Edge 79+, Opera 48+
 * Note: WebUSB requires HTTPS or localhost.
 * 
 * Usage:
 *   const printer = new WebUSBPrinter();
 *   await printer.connect();
 *   await printer.print(byteArray);
 *   await printer.disconnect();
 */

export class WebUSBPrinter {
  constructor() {
    this.device = null;
    this.interfaceNumber = 0;
    this.endpointNumber = 1; // OUT endpoint
    this.configurationValue = 1;
  }

  /**
   * Check if WebUSB is supported in this browser
   * @returns {boolean}
   */
  static isSupported() {
    return 'usb' in navigator;
  }

  /**
   * Request a USB printer device from the user
   * Common vendor IDs: 0x04b8 (Epson), 0x0416 (Winbond), 0x0fe6 (Star)
   * @param {Object} [filters] - Optional USB filters
   * @param {Array<{vendorId: number, productId?: number}>} [filters.filters]
   * @returns {Promise<USBDevice>}
   */
  async requestDevice(filters) {
    if (!WebUSBPrinter.isSupported()) {
      throw new Error('WebUSB is not supported in this browser. Use Chrome or Edge with HTTPS.');
    }

    const defaultFilters = [
      { vendorId: 0x04b8 }, // Epson
      { vendorId: 0x0416 }, // Winbond (many compatible printers)
      { vendorId: 0x0fe6 }, // Star Micronics
      { vendorId: 0x0525 }, // Netchip (Linux GADGET)
      { vendorId: 0x067b }, // Prolific (USB-Serial)
      { vendorId: 0x1fc9 }, // NXP
      { vendorId: 0x0483 }, // STMicroelectronics
    ];

    const device = await navigator.usb.requestDevice({
      filters: filters?.filters || defaultFilters,
    });

    return device;
  }

  /**
   * Connect to a USB printer device
   * @param {USBDevice} [device] - Pre-selected device (will prompt if not provided)
   * @returns {Promise<boolean>} - Whether connection was successful
   */
  async connect(device) {
    try {
      if (!WebUSBPrinter.isSupported()) {
        throw new Error('WebUSB not supported');
      }

      this.device = device || await this.requestDevice();

      if (!this.device) {
        throw new Error('No device selected');
      }

      await this.device.open();

      // Find and select the first configuration with an OUT endpoint
      if (this.device.configuration === null) {
        await this.device.selectConfiguration(this.configurationValue);
      }

      const configuration = this.device.configuration;
      if (!configuration) {
        throw new Error('Device has no configuration');
      }

      // Find the first interface with an OUT endpoint
      for (const iface of configuration.interfaces) {
        for (const endpoint of iface.alternate.endpoints) {
          if (endpoint.direction === 'out') {
            this.interfaceNumber = iface.interfaceNumber;
            this.endpointNumber = endpoint.endpointNumber;
            
            // Claim the interface
            await this.device.claimInterface(this.interfaceNumber);
            
            return true;
          }
        }
      }

      throw new Error('No suitable OUT endpoint found on device');
    } catch (error) {
      console.error('WebUSB connection failed:', error);
      throw error;
    }
  }

  /**
   * Print data to the USB printer
   * @param {Uint8Array|Array<number>} data - ESC/POS byte array to print
   * @returns {Promise<USBOutTransferResult>}
   */
  async print(data) {
    if (!this.device || !this.device.opened) {
      throw new Error('Printer not connected. Call connect() first.');
    }

    const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
    
    try {
      const result = await this.device.transferOut(this.endpointNumber, uint8Data);
      
      if (result.status !== 'ok') {
        throw new Error(`USB transfer failed with status: ${result.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('USB print failed:', error);
      throw error;
    }
  }

  /**
   * Print with progress callback (splits large jobs into chunks)
   * @param {Uint8Array} data - ESC/POS byte array
   * @param {Function} [onProgress] - Callback with progress percentage
   * @returns {Promise<void>}
   */
  async printWithProgress(data, onProgress) {
    if (!data || data.length === 0) return;

    const CHUNK_SIZE = 512; // 512 bytes per transfer
    const totalSize = data.length;
    let offset = 0;

    while (offset < totalSize) {
      const chunk = data.slice(offset, offset + CHUNK_SIZE);
      await this.print(chunk);
      offset += CHUNK_SIZE;

      if (onProgress) {
        onProgress(Math.min(100, Math.round((offset / totalSize) * 100)));
      }
    }
  }

  /**
   * Disconnect from the USB printer
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.device && this.device.opened) {
        // Release claimed interfaces
        try {
          await this.device.releaseInterface(this.interfaceNumber);
        } catch (e) {
          // Interface might already be released
        }

        await this.device.close();
      }
    } catch (error) {
      console.error('USB disconnect error:', error);
    } finally {
      this.device = null;
    }
  }

  /**
   * Get the device info
   * @returns {Object|null}
   */
  getDeviceInfo() {
    if (!this.device) return null;
    
    return {
      manufacturer: this.device.manufacturerName || 'Unknown',
      product: this.device.productName || 'Unknown',
      serialNumber: this.device.serialNumber || 'N/A',
      vendorId: this.device.vendorId?.toString(16) || 'N/A',
      productId: this.device.productId?.toString(16) || 'N/A',
      connected: this.device.opened || false,
    };
  }

  /**
   * Check if currently connected
   * @returns {boolean}
   */
  isConnected() {
    return !!(this.device && this.device.opened);
  }
}

/**
 * Check if WebUSB is available
 * @returns {boolean}
 */
export function isWebUSBSupported() {
  return WebUSBPrinter.isSupported();
}

export default WebUSBPrinter;
