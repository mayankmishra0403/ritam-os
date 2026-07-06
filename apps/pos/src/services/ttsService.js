/**
 * TTSService — Hindi Text-to-Speech feedback for Ritam POS
 *
 * Uses the Web Speech API (SpeechSynthesis) to provide audible
 * confirmation of voice commands in Hindi. This creates a closed-loop
 * voice experience: the waiter speaks, the system responds.
 *
 * Features:
 *  - Hindi voice selection (falls back to system default)
 *  - Configurable speech rate, pitch, and volume
 *  - Queue management (cancels previous speech before new)
 *
 * @author Ritam OS
 */

export class TTSService {
  constructor() {
    this.voicesLoaded = false;
    this.hindiVoice = null;

    // Try to load voices immediately; they may be available async
    this.loadVoices();

    // Some browsers load voices asynchronously — listen for the event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  /**
   * Load available voices and find a Hindi voice.
   */
  loadVoices() {
    if (!window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.voicesLoaded = true;
      // Prefer a Hindi voice, fall back to any Indian English voice
      this.hindiVoice =
        voices.find((v) => v.lang.startsWith('hi')) ||
        voices.find((v) => v.lang.startsWith('en-IN')) ||
        null;
    }
  }

  /**
   * Speak a message using Hindi TTS.
   *
   * @param {string} text — The text to speak
   * @param {string} lang — Language code (default: 'hi-IN')
   * @param {object} options — Optional { rate, pitch, volume }
   */
  speak(text, lang = 'hi-IN', options = {}) {
    if (!window.speechSynthesis) {
      console.warn('[TTSService] Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech so we don't overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = options.rate ?? 0.9;   // Slightly slower for clarity
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    // Use the Hindi voice if available
    if (this.hindiVoice) {
      utterance.voice = this.hindiVoice;
    }

    utterance.onerror = (e) => {
      console.warn('[TTSService] Speech error:', e.error);
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Confirm an item was added to the cart.
   * Example: "पनीर टिक्का डाल दिया"
   */
  confirmItem(itemName, quantity = 1) {
    const qtyText = quantity > 1 ? `${quantity} ` : '';
    const message = quantity > 1
      ? `${qtyText}${itemName} डाल दिये`
      : `${itemName} डाल दिया`;
    this.speak(message);
  }

  /**
   * Confirm that an action was triggered.
   */
  confirmAction(action) {
    const messages = {
      bill: 'बिल तैयार है',
      payment: 'पेमेंट ले रहे हैं',
      cash: 'कैश पेमेंट ले रहे हैं',
      upi: 'यूपीआई पेमेंट ले रहे हैं',
      card: 'कार्ड पेमेंट ले रहे हैं',
      clear: 'सब हटा दिया',
      print: 'प्रिंट हो रहा है',
      stop: 'आवाज़ बंद कर दी',
    };
    this.speak(messages[action] || action);
  }

  /**
   * Announce that the system did not understand the command.
   */
  error() {
    this.speak('समझ नहीं आया। फिर से बोलिए।');
  }

  /**
   * Announce that the system is listening.
   */
  listening() {
    this.speak('बोलिए, सुन रहा हूँ', 'hi-IN', { rate: 1 });
  }

  /**
   * Announce that listening has stopped.
   */
  stopped() {
    this.speak('बंद किया', 'hi-IN', { rate: 1 });
  }
}
