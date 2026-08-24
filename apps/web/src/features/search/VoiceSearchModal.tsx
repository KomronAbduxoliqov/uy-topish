'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Volume2,
  ArrowRight,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { startVoiceRecognition } from '../../lib/utils/speech';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string) => void;
}

export const VoiceSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onTranscriptReady
}) => {
  const { language, showToast } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const stopVoiceRef = useRef<(() => void) | null>(null);

  const quickVoiceSamples =
    language === 'en'
      ? [
          "2-room furnished apartment in Chilanzar under 4M",
          "3-room apartment near Novza metro station",
          "Affordable apartment near INHA or TATU",
          "Luxury 2-room apartment near Tashkent City",
          "3-room apartment in Yunusabad near kindergarten"
        ]
      : language === 'ru'
      ? [
          "2-комнатная квартира на Чиланзаре до 4 млн с мебелью",
          "Возле метро Новза 3-комнатная квартира",
          "Рядом с Университетом ИНХА или ТАТУ недорого",
          "Элитная квартира в районе Tashkent City",
          "На Юнусабаде 3-комнатная рядом с детсадом"
        ]
      : [
          "Chilonzorda 4 mln gacha 2 xonali mebelli",
          "Novza metrosi yaqinidan 3 xonali uy",
          "INHA yoki TATU yaqinidan arzon kvartira",
          "Toshkent City atrofida hashamatli 2 xonali",
          "Yunusobodda bog'chaga yaqin 3 xonali"
        ];

  const handleStartListening = async () => {
    setHasPermissionError(false);
    setErrorMessage('');
    setTranscript('');

    const stopFn = await startVoiceRecognition({
      language: language === 'en' ? 'en' : language === 'ru' ? 'ru' : 'uz',
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (liveText) => {
        setTranscript(liveText);
      },
      onFinal: (finalText) => {
        setTranscript(finalText);
        setIsListening(false);
        setTimeout(() => {
          onTranscriptReady(finalText);
          onClose();
        }, 600);
      },
      onError: (err) => {
        setIsListening(false);
        setHasPermissionError(true);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    stopVoiceRef.current = stopFn;
  };

  useEffect(() => {
    if (isOpen) {
      handleStartListening();
    } else {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
      setIsListening(false);
      setHasPermissionError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-extrabold mb-3 border border-brand-200 dark:border-brand-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {language === 'en' ? 'Voice Search Assistant' : language === 'ru' ? 'Голосовой поиск' : 'Ovozli Qidiruv Yordamchisi'}
          </span>
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
          {hasPermissionError
            ? (language === 'en' ? 'Microphone access blocked' : language === 'ru' ? 'Доступ к микрофону заблокирован' : 'Mikrofonga ruxsat berilmagan')
            : isListening
            ? (language === 'en' ? 'Listening...' : language === 'ru' ? 'Слушаю вас...' : 'Sizni tinglamoqdaman...')
            : (language === 'en' ? 'Press to speak' : language === 'ru' ? 'Нажмите для записи' : 'Gapirish uchun tugmani bosing')}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6 font-medium">
          {hasPermissionError
            ? (language === 'en'
                ? 'Microphone access is restricted in your browser. Follow these steps to allow:'
                : language === 'ru'
                ? 'В браузере заблокирован микрофон. Разрешите доступ:'
                : "Brauzerda mikrofondan foydalanish cheklangan. Quyidagi qo'llanma orqali yoqishingiz mumkin:")
            : (language === 'en'
                ? 'Speak naturally (district, price, number of rooms, or metro)'
                : language === 'ru'
                ? 'Скажите параметры жилья (район, цена, комнаты или метро)'
                : "Kerakli uyni erkin tilda ayting (tuman, narx, xona soni yoki metro)")}
        </p>

        {/* Big Animated Mic Pulse Circle */}
        {!hasPermissionError && (
          <div className="relative my-2">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-rose-500/10 animate-pulse" />
              </>
            )}
            <button
              type="button"
              onClick={isListening ? () => stopVoiceRef.current?.() : handleStartListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>
        )}

        {/* Live Transcript Display */}
        {transcript && !hasPermissionError && (
          <div className="w-full mt-4 p-3 bg-brand-50/80 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 animate-fadeIn">
            "{transcript}"
          </div>
        )}

        {/* Permission Help Box if blocked */}
        {hasPermissionError && (
          <div className="w-full text-left bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5 mb-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>
                {language === 'en' ? 'Enable microphone in 2 seconds:' : language === 'ru' ? 'Включить микрофон за 2 секунды:' : 'Mikrofonni 2 soniyada yoqish:'}
              </span>
            </div>

            <ol className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
              <li>
                {language === 'en'
                  ? 'Click the 🔒 Lock or Settings icon in your browser address bar.'
                  : language === 'ru'
                  ? 'Нажмите на значок 🔒 Замка в адресной строке браузера.'
                  : "Brauzer manzil qatoridagi (URL yonidagi 🔒 Qulf yoki Sozlamalar) belgisini bosing."}
              </li>
              <li>
                {language === 'en'
                  ? 'Change Microphone permission to "Allow".'
                  : language === 'ru'
                  ? 'Переключите пункт Микрофон (Microphone) на "Разрешить" (Allow).'
                  : 'Mikrofon (Microphone) bandini "Ruxsat berish" (Allow) holatiga o\'tkazing.'}
              </li>
              <li>
                {language === 'en'
                  ? 'Open the app in Google Chrome at http://localhost:3000.'
                  : language === 'ru'
                  ? 'Откройте сайт в Google Chrome по адресу http://localhost:3000.'
                  : 'Saytni Google Chrome brauzerida http://localhost:3000 qilib oching.'}
              </li>
            </ol>

            <button
              type="button"
              onClick={handleStartListening}
              className="w-full mt-2 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {language === 'en' ? 'Try Again' : language === 'ru' ? 'Попробовать снова' : "Qaytadan urinib ko'rish"}
              </span>
            </button>
          </div>
        )}

        {/* Quick Voice Query Alternatives (1-Click) */}
        <div className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
            {language === 'en' ? 'Or pick a sample voice query:' : language === 'ru' ? 'Или выберите готовый запрос:' : "Yoki tayyor so'rovlardan birini tanlang:"}
          </span>
          <div className="flex flex-col gap-1.5">
            {quickVoiceSamples.slice(0, 3).map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onTranscriptReady(sample);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-300 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/70 dark:border-slate-700 transition-colors text-left group"
              >
                <span className="truncate">"{sample}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
