import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SyncManager } from '../../services/syncManager';

/**
 * NetworkStatus — A top banner that appears when the device goes offline
 * and disappears when connectivity is restored.
 *
 * - Shows an orange "You are offline" banner with pending op count
 * - Shows a green "Back online! Syncing..." banner on reconnection
 * - Uses framer-motion for slide-down/up animation
 */
export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [showReconnected, setShowReconnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Update pending count from IndexedDB
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await SyncManager.getPendingCount();
      setPendingCount(count);
    } catch {
      // IndexedDB might not be available
      setPendingCount(0);
    }
  }, []);

  // Force sync all pending operations on reconnect
  const handleForceSync = useCallback(async () => {
    setSyncing(true);
    try {
      await SyncManager.forceSync();
      await updatePendingCount();
    } catch (err) {
      console.error('Force sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }, [updatePendingCount]);

  useEffect(() => {
    // Initialize online state
    setIsOnline(navigator.onLine);
    updatePendingCount();

    // Listen for service worker sync messages
    const handleSWMessage = (event) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        updatePendingCount();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    // Listen for connectivity changes
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Auto-sync when coming back online
      handleForceSync();
      // Hide the "back online" message after 4 seconds
      setTimeout(() => setShowReconnected(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      updatePendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updatePendingCount, handleForceSync]);

  // Periodically check pending count
  useEffect(() => {
    const interval = setInterval(updatePendingCount, 10000);
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  // Determine what banner to show
  const showOffline = !isOnline;
  const showBanner = showOffline || showReconnected;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`relative z-50 w-full px-6 py-3 text-sm font-medium flex items-center justify-between gap-4 ${
            showOffline
              ? 'bg-orange-500 text-white'
              : 'bg-emerald-500 text-white'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-3">
            {showOffline ? (
              <>
                <WifiOff className="w-5 h-5 shrink-0" />
                <span>
                  You are offline.
                  {pendingCount > 0
                    ? ` ${pendingCount} operation${pendingCount !== 1 ? 's' : ''} queued. Orders will sync when connected.`
                    : ' Browsing cached data.'}
                </span>
              </>
            ) : (
              <>
                {syncing ? (
                  <RefreshCw className="w-5 h-5 shrink-0 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                )}
                <span>
                  {syncing
                    ? 'Back online! Syncing...'
                    : 'Back online! All data synced.'}
                </span>
              </>
            )}
          </div>

          {showOffline && pendingCount > 0 && (
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition disabled:opacity-50 text-white text-xs font-semibold"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}

          {!showOffline && (
            <button
              onClick={() => setShowReconnected(false)}
              className="p-1 rounded-full hover:bg-white/20 transition"
              aria-label="Dismiss"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
