/**
 * Printer Store (Zustand)
 * 
 * Manages:
 * - Configured printers list
 * - Default printer
 * - Print queue / current print job state
 * - Print history
 * 
 * Each printer config:
 * {
 *   id: string,
 *   name: string,
 *   type: 'thermal' | 'a4' | 'pdf',
 *   connection: 'usb' | 'bluetooth' | 'network' | 'serial',
 *   ip: string,
 *   port: number,
 *   isDefault: boolean,
 *   vendorId: number,
 *   productId: number,
 *   bluetoothId: string,
 *   isActive: boolean,
 *   paperSize: '80mm' | '58mm' | 'a4',
 *   createdAt: string,
 * }
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_PRINTERS = [
  {
    id: 'pr-interal-1',
    name: 'Kitchen Printer (Network)',
    type: 'thermal',
    connection: 'network',
    ip: '192.168.1.100',
    port: 9100,
    isDefault: true,
    isActive: true,
    paperSize: '80mm',
  },
  {
    id: 'pr-interal-2',
    name: 'Counter Printer (Network)',
    type: 'thermal',
    connection: 'network',
    ip: '192.168.1.101',
    port: 9100,
    isDefault: false,
    isActive: true,
    paperSize: '80mm',
  },
];

const usePrinterStore = create(
  persist(
    (set, get) => ({
      // ─── State ───
      printers: DEFAULT_PRINTERS,

      // Print job state
      isPrinting: false,
      currentPrintJob: null,
      printQueue: [],
      lastPrintResult: null,
      printHistory: [],

      // Connection dialog state
      showPrintDialog: false,
      printDialogMode: 'add', // 'add' | 'edit'
      editingPrinterId: null,

      // ─── Actions: Printers ───

      /** Add a new printer */
      addPrinter: (printer) =>
        set((state) => ({
          printers: [
            ...state.printers,
            {
              ...printer,
              id: `pr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      /** Update an existing printer */
      updatePrinter: (id, updates) =>
        set((state) => ({
          printers: state.printers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      /** Remove a printer */
      removePrinter: (id) =>
        set((state) => ({
          printers: state.printers.filter((p) => p.id !== id),
        })),

      /** Set a printer as default */
      setDefaultPrinter: (id) =>
        set((state) => ({
          printers: state.printers.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        })),

      /** Get the default printer */
      getDefaultPrinter: () => {
        const state = get();
        return state.printers.find((p) => p.isDefault) || state.printers[0];
      },

      /** Toggle printer active state */
      togglePrinterActive: (id) =>
        set((state) => ({
          printers: state.printers.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        })),

      // ─── Actions: Print Dialog ───

      /** Open the add printer dialog */
      openAddPrinter: () =>
        set({
          showPrintDialog: true,
          printDialogMode: 'add',
          editingPrinterId: null,
        }),

      /** Open the edit printer dialog */
      openEditPrinter: (id) =>
        set({
          showPrintDialog: true,
          printDialogMode: 'edit',
          editingPrinterId: id,
        }),

      /** Close the print dialog */
      closePrintDialog: () =>
        set({
          showPrintDialog: false,
          printDialogMode: 'add',
          editingPrinterId: null,
        }),

      // ─── Actions: Printing ───

      /** Set printing state */
      setPrinting: (isPrinting, jobInfo = null) =>
        set({
          isPrinting,
          currentPrintJob: jobInfo,
        }),

      /** Add to print queue */
      addToPrintQueue: (job) =>
        set((state) => ({
          printQueue: [...state.printQueue, { id: Date.now(), ...job }],
        })),

      /** Remove from print queue */
      removeFromPrintQueue: (jobId) =>
        set((state) => ({
          printQueue: state.printQueue.filter((j) => j.id !== jobId),
        })),

      /** Clear print queue */
      clearPrintQueue: () => set({ printQueue: [] }),

      /** Add to print history */
      addToPrintHistory: (result) =>
        set((state) => ({
          printHistory: [
            {
              id: `ph-${Date.now()}`,
              timestamp: new Date().toISOString(),
              ...result,
            },
            ...state.printHistory.slice(0, 50), // Keep last 50
          ],
        })),

      /** Set last print result */
      setLastPrintResult: (result) => set({ lastPrintResult: result }),

      // ─── Actions: Restaurant Info (for receipts) ───

      /** Get default restaurant info for receipts */
      getRestaurantInfo: () => {
        // In a real app, this would come from settings store
        // For now, return defaults
        return {
          name: 'Ritam Restaurant',
          address: 'Connaught Place, New Delhi - 110001',
          gstin: '07ABCDE1234F1Z5',
          fssai: '12345678901234',
          phone: '+91 9876543210',
          upiId: 'ritam@paytm',
          outletCode: 'MAIN',
        };
      },

      /** Reset to defaults */
      resetPrinters: () =>
        set({
          printers: DEFAULT_PRINTERS,
          printHistory: [],
        }),
    }),
    {
      name: 'ritam-pos-printer-storage',
      partialize: (state) => ({
        printers: state.printers,
        printHistory: state.printHistory.slice(0, 50),
      }),
    }
  )
);

export default usePrinterStore;
