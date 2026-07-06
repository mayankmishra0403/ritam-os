/**
 * VoiceService — Hindi Voice Recognition for Ritam POS
 *
 * Uses the Web Speech API (SpeechRecognition) built into Chrome.
 * Supports Hindi (hi-IN) natively with continuous listening and
 * multiple alternative results for better fuzzy matching.
 *
 * @author Ritam OS
 */

export class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this._shouldBeListening = false;

    // Callbacks
    this.onResult = null;
    this.onError = null;
    this.onEnd = null;
  }

  /**
   * Initialise the SpeechRecognition engine.
   * Returns true if the browser supports speech recognition, false otherwise.
   */
  init(lang = 'hi-IN') {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[VoiceService] Speech recognition not supported in this browser');
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 5; // Multiple alternatives for better matching

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResult) {
        this.onResult({
          final: finalTranscript,
          interim: interimTranscript,
          allResults: event.results,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('[VoiceService] Error:', event.error);

      // 'no-speech' is common on first open — don't propagate as critical
      if (event.error === 'no-speech') {
        return;
      }

      // 'aborted' happens when we call stop() manually — ignore
      if (event.error === 'aborted') {
        return;
      }

      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();

      // Auto-restart if we are supposed to keep listening
      if (this._shouldBeListening) {
        this.start();
      }
    };

    return true;
  }

  /**
   * Start listening. Safely handles the "already started" exception.
   */
  start() {
    if (!this.recognition || this.isListening) return;
    this._shouldBeListening = true;
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      // DOM exception 0x502 — already started, ignore silently
      if (e.name !== 'InvalidStateError') {
        console.error('[VoiceService] Failed to start recognition:', e);
      }
    }
  }

  /**
   * Stop listening.
   */
  stop() {
    this._shouldBeListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore errors on stop
      }
    }
    this.isListening = false;
  }

  /**
   * Toggle listening on / off.
   */
  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Change the recognition language at runtime.
   */
  setLanguage(lang) {
    const wasListening = this.isListening;
    if (wasListening) this.stop();
    if (this.recognition) {
      this.recognition.lang = lang;
    }
    if (wasListening) this.start();
  }

  /**
   * Fully destroy the service — stop listening and release the recogniser.
   */
  destroy() {
    this.stop();
    this.recognition = null;
    this.onResult = null;
    this.onError = null;
    this.onEnd = null;
  }
}
