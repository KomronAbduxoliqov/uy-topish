/**
 * Rock-Solid Speech Recognition (Speech-to-Text) and Speech Synthesis (Text-to-Speech)
 * for UyTop AI across Uzbek, Russian, and English.
 */

export interface VoiceRecognitionOptions {
  language?: 'uz' | 'ru' | 'en';
  onStart?: () => void;
  onInterim?: (interimText: string) => void;
  onFinal: (finalText: string) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

export const isVoiceRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition
  );
};

let activeRecognitionInstance: any = null;
let silenceTimer: any = null;

export const startVoiceRecognition = async (options: VoiceRecognitionOptions): Promise<() => void> => {
  if (typeof window === 'undefined') return () => {};

  const SpeechRecognitionClass =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;

  if (!SpeechRecognitionClass) {
    if (options.onError) {
      options.onError(
        options.language === 'en'
          ? 'Voice search is supported in Google Chrome, Microsoft Edge, and Opera. Please open in Chrome or Edge.'
          : options.language === 'ru'
          ? 'Голосовой ввод поддерживается в Google Chrome, Яндекс Браузере и Microsoft Edge.'
          : "Ovozli qidiruv Google Chrome, Edge va Yandex Browser brauzerlarida ishlaydi. Iltimos, Chrome yoki Edge'da oching."
      );
    }
    return () => {};
  }

  // Stop any active previous recognition
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.abort();
    } catch {}
    activeRecognitionInstance = null;
  }

  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }

  const primaryLang = options.language === 'en' ? 'en-US' : options.language === 'ru' ? 'ru-RU' : 'uz-UZ';
  const fallbackLang = 'ru-RU';

  let accumulatedText = '';
  let recognition: any = null;
  let isManuallyStopped = false;

  const cleanup = () => {
    isManuallyStopped = true;
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
    if (activeRecognitionInstance) {
      try {
        activeRecognitionInstance.stop();
      } catch {}
      activeRecognitionInstance = null;
    }
  };

  try {
    recognition = new SpeechRecognitionClass();
    recognition.lang = primaryLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (options.onStart) options.onStart();
    };

    const scheduleSilenceFinalize = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        const textToSubmit = accumulatedText.trim();
        if (textToSubmit && !isManuallyStopped) {
          options.onFinal(textToSubmit);
          cleanup();
        }
      }, 1400); // 1.4s of silence finishes utterance automatically
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const part = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          finalChunk += (finalChunk ? ' ' : '') + part;
        } else {
          interim += part;
        }
      }

      if (finalChunk) {
        accumulatedText = (accumulatedText ? accumulatedText + ' ' : '') + finalChunk;
      }

      const liveFull = (accumulatedText + (interim ? (accumulatedText ? ' ' : '') + interim : '')).trim();
      if (liveFull) {
        if (options.onInterim) options.onInterim(liveFull);
        scheduleSilenceFinalize();
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition event error:', event.error);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        if (options.onError) {
          options.onError(
            options.language === 'en'
              ? 'Microphone permission blocked. Please click the 🔒 icon in your browser URL bar and allow microphone.'
              : options.language === 'ru'
              ? 'Микрофон заблокирован. Разрешите доступ к микрофону в адресной строке браузера (значок 🔒).'
              : "Mikrofon bloklangan. Brauzer manzil qatoridagi (🔒 yoki 🎙️) belgidan mikrofonga ruxsat bering."
          );
        }
        cleanup();
      } else if (event.error === 'language-not-supported' && recognition.lang !== fallbackLang) {
        try {
          recognition.lang = fallbackLang;
          recognition.start();
        } catch {
          cleanup();
        }
      } else if (event.error === 'no-speech') {
        // Silent timeout, keep listening
      }
    };

    recognition.onend = () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      if (options.onEnd) options.onEnd();

      const finalResult = accumulatedText.trim();
      if (finalResult && !isManuallyStopped) {
        options.onFinal(finalResult);
      }
      activeRecognitionInstance = null;
    };

    activeRecognitionInstance = recognition;
    recognition.start();
  } catch (err: any) {
    console.warn('Speech recognition startup error:', err);
    cleanup();
    if (options.onError) {
      options.onError(
        options.language === 'en'
          ? 'Could not start microphone. Please open site in Google Chrome or Edge.'
          : options.language === 'ru'
          ? 'Не удалось запустить микрофон. Откройте сайт в Google Chrome или Microsoft Edge.'
          : "Mikrofonni ishga tushirib bo'lmadi. Saytni Google Chrome yoki Microsoft Edge brauzerida oching."
      );
    }
  }

  return cleanup;
};

/**
 * Text-to-Speech (TTS) synthesizer: Speaks out text aloud in natural voice
 */
export const speakTextAloud = (text: string, language: 'uz' | 'ru' | 'en' = 'uz', onEnd?: () => void) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch {}

  const cleanText = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#*_`~[\]()]/g, '')
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'ru-RU';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const playSpeech = () => {
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const selectedVoice = voices.find((v) =>
          language === 'en'
            ? v.lang.startsWith('en')
            : language === 'ru'
            ? v.lang.startsWith('ru')
            : v.lang.startsWith('uz') || v.lang.startsWith('ru')
        );

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      playSpeech();
    };
    setTimeout(playSpeech, 100);
  } else {
    playSpeech();
  }
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
};
