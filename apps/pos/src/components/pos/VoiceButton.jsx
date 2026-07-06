/**
 * VoiceButton — Floating microphone button for Hindi voice ordering
 *
 * Integrates with the Web Speech API to capture Hindi voice commands,
 * parse them into structured POS actions, and provide real-time feedback.
 *
 * Features:
 *  - Floating action button with pulse animation when listening
 *  - Real-time transcript display
 *  - Feedback toast for success/error/info states
 *  - Audio (TTS) confirmation in Hindi
 *  - Graceful degradation if Speech API is unavailable
 *
 * Dependencies:
 *  - framer-motion (animations)
 *  - lucide-react (icons)
 *  - VoiceService, VoiceCommandParser, TTSService
 *
 * @param {Array}    products      — Array of product objects from mockData
 * @param {Array}    modifiersList — Array of modifier objects for mapping
 * @param {Function} onAddItem     — (product, modifierObjects) => void (store addToCart)
 * @param {Function} onAction      - (actionName) => void
 *
 * @author Ritam OS
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { VoiceService } from '../../services/voiceService';
import { VoiceCommandParser } from '../../services/voiceCommands';
import { TTSService } from '../../services/ttsService';
import { getVoiceSettings, getSpeechRecognitionLang } from '../../services/voiceSettings';

export default function VoiceButton({
  products = [],
  modifiersList = [],
  onAddItem,
  onAction,
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); // { type, message }
  const [supported, setSupported] = useState(true);

  const voiceRef = useRef(null);
  const parserRef = useRef(null);
  const ttsRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // ── Initialise services once ──
  useEffect(() => {
    const settings = getVoiceSettings();
    if (!settings.enabled) return;

    // Check if SpeechRecognition is available at all
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    ttsRef.current = new TTSService();

    return () => {
      if (voiceRef.current) {
        voiceRef.current.destroy();
        voiceRef.current = null;
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // ── Rebuild parser when products / modifiers change ──
  useEffect(() => {
    const settings = getVoiceSettings();
    parserRef.current = new VoiceCommandParser(
      products,
      modifiersList,
      settings.sensitivity || 0.7
    );
  }, [products, modifiersList]);

  // ── Feedback helper ──
  const showFeedback = useCallback((type, message, duration = 3000) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedback({ type, message });
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, duration);
  }, []);

  // ── Lazy init VoiceService (only on first toggle) ──
  const ensureVoiceService = useCallback(() => {
    if (voiceRef.current) return true;

    const settings = getVoiceSettings();
    const voice = new VoiceService();
    const recogLang = getSpeechRecognitionLang(settings.language || 'hi-IN');
    const ok = voice.init(recogLang);

    if (!ok) {
      setSupported(false);
      showFeedback('error', '🎤 Voice not supported in this browser');
      return false;
    }

    voice.onResult = ({ final, interim }) => {
      const text = final || interim;
      setTranscript(text);

      if (final && parserRef.current) {
        const parsed = parserRef.current.parse(final);

        if (parsed.isCommand) {
          // ── Add matched items to cart ──
          if (parsed.items.length > 0) {
            parsed.items.forEach((item) => {
              for (let i = 0; i < parsed.quantity; i++) {
                onAddItem(item, parsed.modifierObjects || []);
              }
            });

            const displayName =
              parsed.items[0].nameHi || parsed.items[0].name;
            showFeedback(
              'success',
              `✅ ${parsed.quantity}x ${displayName} add kiya`,
              2500
            );

            // TTS confirmation
            if (ttsRef.current) {
              ttsRef.current.confirmItem(
                parsed.items[0].nameHi || parsed.items[0].name,
                parsed.quantity
              );
            }
          }

          // ── Trigger action commands ──
          if (parsed.action && onAction) {
            onAction(parsed.action);
            showFeedback('info', `🎯 ${parsed.action}`, 2000);

            if (ttsRef.current) {
              ttsRef.current.confirmAction(parsed.action);
            }
          }
        } else {
          showFeedback('error', '🤔 Samajh nahi aaya. Phir se boliye.');
          if (ttsRef.current) {
            ttsRef.current.error();
          }
        }
      }
    };

    voice.onError = (error) => {
      if (error === 'not-allowed') {
        showFeedback('error', '🎤 Microphone permission denied. Allow mic access in browser settings.', 5000);
      } else if (error === 'network') {
        // Network error is non-critical — silently retry
        console.warn('[VoiceButton] Network error, retrying...');
      } else {
        showFeedback('error', `🎤 Error: ${error}`, 3000);
      }
    };

    voice.onEnd = () => {
      setIsListening(false);
    };

    voiceRef.current = voice;
    return true;
  }, [onAddItem, onAction, showFeedback]);

  // ── Toggle listening ──
  const toggleListening = useCallback(() => {
    if (isListening) {
      // Stop
      if (voiceRef.current) {
        voiceRef.current.stop();
      }
      setIsListening(false);
      setTranscript('');
      return;
    }

    // Start
    if (!ensureVoiceService()) return;

    const settings = getVoiceSettings();
    if (voiceRef.current && voiceRef.current.recognition) {
      // Update language in case it changed in settings
      const recogLang = getSpeechRecognitionLang(settings.language || 'hi-IN');
      voiceRef.current.setLanguage(recogLang);
    }

    // Update parser sensitivity
    if (parserRef.current) {
      parserRef.current.setSensitivity(settings.sensitivity || 0.7);
    }

    voiceRef.current.start();
    setIsListening(true);
    setTranscript('');

    // TTS feedback that we're listening
    if (ttsRef.current) {
      ttsRef.current.listening();
    }
  }, [isListening, ensureVoiceService]);

  // ── Keyboard shortcut: Ctrl+Shift+V to toggle ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  // ── If unsupported, show nothing ──
  if (!supported) return null;

  return (
    <>
      {/* ── Feedback Toast ── */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key="voice-feedback"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-base font-medium whitespace-nowrap ${
              feedback.type === 'success'
                ? 'bg-green-500'
                : feedback.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-600'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transcript bubble ── */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            key="voice-transcript"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-28 right-6 z-50 max-w-xs bg-[#1A1A2E]/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">🎤</span>
              <span className="leading-snug">{transcript}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voice Button ── */}
      <motion.button
        onClick={toggleListening}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-shadow duration-300 ${
          isListening
            ? 'bg-red-500 voice-pulse shadow-red-500/50'
            : 'bg-[#FF6B35] hover:shadow-orange-500/40 shadow-orange-500/20'
        }`}
        aria-label={isListening ? 'Stop voice ordering' : 'Start voice ordering'}
        title={
          isListening
            ? 'Stop voice ordering (Ctrl+Shift+V)'
            : 'Start Hindi voice ordering (Ctrl+Shift+V)'
        }
      >
        {isListening ? (
          <MicOff className="w-6 h-6 md:w-7 md:h-7 text-white" />
        ) : (
          <Mic className="w-6 h-6 md:w-7 md:h-7 text-white" />
        )}
      </motion.button>
    </>
  );
}
