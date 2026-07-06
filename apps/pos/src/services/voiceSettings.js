/**
 * VoiceSettings — Persisted voice configuration for Ritam POS
 *
 * Stores and retrieves voice ordering preferences from localStorage.
 * Shared between SettingsPage (UI controls) and VoiceButton (runtime).
 *
 * @author Ritam OS
 */

const STORAGE_KEY = 'ritam_voice_settings';

const DEFAULT_SETTINGS = {
  enabled: true,
  language: 'hi-IN',
  sensitivity: 0.7,
};

/**
 * Read the current voice settings from localStorage.
 * Returns the full settings object merged with defaults.
 */
export function getVoiceSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('[VoiceSettings] Failed to parse stored settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Merge partial settings into the stored configuration.
 *
 * @param {object} partial — subset of settings to update
 * @returns {object} the full updated settings
 */
export function setVoiceSettings(partial) {
  const current = getVoiceSettings();
  const updated = { ...current, ...partial };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[VoiceSettings] Failed to persist settings:', e);
  }
  return updated;
}

/**
 * Reset voice settings to factory defaults.
 */
export function resetVoiceSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[VoiceSettings] Failed to reset settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Human-readable label for each language code.
 *
 * Note: 'hi-Latn' is a custom code for "Hinglish" mode — it uses
 * Hindi recognition internally but applies a broader Hinglish lexicon
 * for fuzzy matching (mixes of Hindi and English words).
 */
export const LANGUAGE_OPTIONS = [
  { value: 'hi-IN', label: 'Hindi (हिन्दी)', short: 'HI' },
  { value: 'hi-Latn', label: 'Hinglish (हिंग्लिश)', short: 'HG' },
  { value: 'en-IN', label: 'English (Indian)', short: 'EN' },
];

export const LANGUAGE_LABELS = {
  'hi-IN': 'Hindi (हिन्दी)',
  'hi-Latn': 'Hinglish (हिंग्लिश)',
  'en-IN': 'English (Indian)',
};

/**
 * Map the user-facing language code to the actual SpeechRecognition language.
 * 'hi-Latn' (Hinglish) uses 'hi-IN' for recognition since the Web Speech API
 * does not have a separate Hinglish model.
 */
export function getSpeechRecognitionLang(lang) {
  if (lang === 'hi-Latn') return 'hi-IN';
  return lang || 'hi-IN';
}
