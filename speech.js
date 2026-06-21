/* ============================================================
   TUTORIS - UNSAAC | Módulo de Voz (Web Speech API)
   ============================================================ */

class SpeechManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.voiceEnabled = true;
    this.selectedVoice = null;
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;

    this._initRecognition();
    this._loadVoice();
  }

  // Cargar la mejor voz en español disponible
  _loadVoice() {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      const spanishVoices = voices.filter(v =>
        v.lang.startsWith('es') || v.lang === 'es-PE' || v.lang === 'es-ES' || v.lang === 'es-US' || v.lang === 'es-419'
      );

      // Prioridad: es-PE > es-US > es-ES > cualquier es-*
      this.selectedVoice =
        spanishVoices.find(v => v.lang === 'es-PE') ||
        spanishVoices.find(v => v.lang === 'es-US') ||
        spanishVoices.find(v => v.lang === 'es-419') ||
        spanishVoices.find(v => v.lang === 'es-ES') ||
        spanishVoices[0] ||
        null;

      console.log('🎙️ Voz seleccionada:', this.selectedVoice?.name || 'ninguna');
    };

    if (this.synth.getVoices().length > 0) {
      setVoice();
    }
    this.synth.addEventListener('voiceschanged', setVoice);
  }

  // Inicializar reconocimiento de voz
  _initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('⚠️ SpeechRecognition no soportado en este navegador');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-PE';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      if (this.onResult) this.onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (this.onError) this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };
  }

  // Iniciar escucha
  startListening() {
    if (!this.recognition) {
      if (this.onError) this.onError('no-support');
      return false;
    }
    if (this.isListening) return false;
    if (this.isSpeaking) this.synth.cancel();

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Error al iniciar reconocimiento:', e);
      return false;
    }
  }

  // Detener escucha
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Hablar texto
  speak(text, onDone) {
    if (!this.voiceEnabled || !text) {
      if (onDone) onDone();
      return;
    }

    // Cancelar habla anterior
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    // Limpiar texto de caracteres especiales
    const cleanText = text
      .replace(/[🎓😊✅⚠️📌🎙️]/g, '')
      .replace(/\*\*/g, '')
      .substring(0, 500); // limitar longitud

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-PE';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => {
      this.isSpeaking = false;
      if (onDone) onDone();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onDone) onDone();
    };

    this.synth.speak(utterance);
  }

  // Detener habla
  stopSpeaking() {
    if (this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  // Toggle voz activada/desactivada
  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    if (!this.voiceEnabled) this.stopSpeaking();
    return this.voiceEnabled;
  }

  // Verificar soporte
  isSpeechSupported() {
    return !!window.speechSynthesis;
  }

  isRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

window.SpeechManager = SpeechManager;
