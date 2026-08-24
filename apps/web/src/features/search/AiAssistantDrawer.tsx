'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  MapPin,
  Train,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Building2,
  DollarSign,
  Home,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiClient } from '../../lib/api/client';
import { Property, ParsedAIIntent } from '@uytop/shared-types';
import { formatPriceUzs } from '../../lib/utils/formatters';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  matchedProperties?: Property[];
  parsedIntent?: ParsedAIIntent;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC = () => {
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    language,
    setProperties,
    setActivePropertyId,
    setFilters,
    setMapSelection,
    showToast
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting =
    language === 'en'
      ? "Hello! I am UyTop AI Assistant. I can help you find your dream home in Tashkent by any parameters (price, district, metro, furnished, near university or landmark). What kind of property are you looking for?"
      : language === 'ru'
      ? 'Здравствуйте! Я AI-ассистент UyTop. Помогу вам подобрать идеальное жилье в Ташкенте по любым параметрам (цена, метро, район, мебель, рядом с вузом или ориентиром). Какое жилье вас интересует?'
      : "Assalomu alaykum! Men UyTop AI assistentiman. Toshkent shahri bo'ylab siz xohlagan har qanday parametrdagi (narx, tuman, metro, mebel, universitet yoki landmark yaqinidan) uyni topishda yordam beraman. Qanday uy qidiryapsiz?";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    {
      uz: 'Chilonzorda 4 mln gacha 2 xonali mebelli',
      ru: 'На Чиланзаре до 4 млн 2-комнатная с мебелью',
      en: 'In Chilanzar up to 4M 2-room furnished'
    },
    {
      uz: 'Novza yoki Mirzo Ulug\'bek metrosi yaqinidan',
      ru: 'Возле метро Новза или Мирзо Улугбек',
      en: 'Near Novza or Mirzo Ulugbek metro station'
    },
    {
      uz: 'INHA yoki TATU yaqinidan arzon',
      ru: 'Возле Университета ИНХА или ТАТУ',
      en: 'Affordable near INHA or TUIT university'
    },
    {
      uz: 'Toshkent City atrofida hashamatli kvartira',
      ru: 'Возле Tashkent City элитная квартира',
      en: 'Luxury apartment around Tashkent City'
    },
    {
      uz: 'Yunusobodda yangi ta\'mirli 3 xonali',
      ru: 'На Юнусабаде с новым ремонтом 3-комнатная',
      en: 'In Yunusabad newly renovated 3-room'
    }
  ];

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome-')) {
        return [{ ...prev[0], text: initialGreeting }];
      }
      return prev;
    });
  }, [language, initialGreeting]);

  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiDrawerOpen]);

  if (!isAiDrawerOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsgId = 'usr-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await apiClient.parseAndSearchWithAi(query);

      const aiText =
        language === 'en'
          ? `${res.parsedIntent.explanationEn || res.parsedIntent.explanationUz || 'Your query has been analyzed.'} Found ${res.properties.length} matching properties:`
          : language === 'ru'
          ? `${res.parsedIntent.explanationRu || 'Объявления проанализированы.'} Найдено ${res.properties.length} подходящих вариантов:`
          : `${res.parsedIntent.explanationUz || 'So\'rovingiz bo\'yicha e\'lonlar tahlil qilindi.'} Jami ${res.properties.length} ta eng mos variant saralandi:`;

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiText,
        matchedProperties: res.properties,
        parsedIntent: res.parsedIntent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setProperties(res.properties);

      if (res.parsedIntent.centerLat && res.parsedIntent.centerLng) {
        setMapSelection(
          { lat: res.parsedIntent.centerLat, lng: res.parsedIntent.centerLng },
          res.parsedIntent.radiusMeters || 2500
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text:
          language === 'en'
            ? 'Sorry, there was an error processing your query. Please try again.'
            : language === 'ru'
            ? 'Извините, произошла ошибка при обработке запроса. Пожалуйста, попробуйте снова.'
            : "Kechirasiz, so'rovingizni tahlil qilishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                <span>
                  {language === 'en' ? 'UyTop AI Assistant' : language === 'ru' ? 'AI Ассистент UyTop' : 'UyTop AI Yordamchisi'}
                </span>
                <span className="bg-brand-500/20 text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                  v2.5 PRO
                </span>
              </h3>
              <p className="text-xs text-brand-300 font-medium">
                {language === 'en'
                  ? 'AI Real Estate Assistant'
                  : language === 'ru'
                  ? 'AI Ассистент по недвижимости'
                  : 'AI Qidiruv yordamchisi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title={language === 'en' ? 'New chat' : language === 'ru' ? 'Новый диалог' : 'Yangi suhbat'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsAiDrawerOpen(false);
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title={language === 'en' ? 'Close' : language === 'ru' ? 'Закрыть' : 'Yopish'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`flex gap-2.5 max-w-[92%] ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'bg-brand-600 text-white shadow-md'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Text Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-subtle ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Parsed Intent Summary Badges if present */}
                  {msg.parsedIntent && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-1">
                      {msg.parsedIntent.district && (
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-[10px] font-bold border border-brand-200 dark:border-brand-800">
                          📍 {msg.parsedIntent.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}
                        </span>
                      )}
                      {msg.parsedIntent.rooms && (
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-[10px] font-bold border border-brand-200 dark:border-brand-800">
                          🚪 {msg.parsedIntent.rooms} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'}
                        </span>
                      )}
                      {msg.parsedIntent.maxPrice && (
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-[10px] font-bold border border-brand-200 dark:border-brand-800">
                          💰 ≤ {(msg.parsedIntent.maxPrice / 1000000).toLocaleString('uz-UZ')} {language === 'en' ? 'M UZS' : language === 'ru' ? 'млн сум' : 'mln'}
                        </span>
                      )}
                      {msg.parsedIntent.nearMetro && (
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-[10px] font-bold border border-brand-200 dark:border-brand-800">
                          🚇 {language === 'en' ? 'Near Metro' : language === 'ru' ? 'Рядом с метро' : 'Metro'}
                        </span>
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-brand-100 text-right' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>

              {/* Matched Property Cards inside Chat */}
              {msg.matchedProperties && msg.matchedProperties.length > 0 && (
                <div className="mt-3 w-full pl-10 space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {language === 'en' ? 'Recommended Properties:' : language === 'ru' ? 'Рекомендованные объекты:' : 'Tavsiya qilingan uylar:'}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.matchedProperties.slice(0, 3).map((prop) => (
                      <div
                        key={prop.id}
                        onClick={() => {
                          setActivePropertyId(prop.id);
                          setIsAiDrawerOpen(false);
                        }}
                        className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 p-2.5 rounded-xl flex items-center justify-between hover:border-brand-500 hover:shadow-sm cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              prop.images && prop.images.length > 0
                                ? prop.images[0].thumbnailUrl || prop.images[0].originalUrl
                                : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={prop.titleUz}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                              {language === 'en' ? (prop.titleEn || prop.titleUz) : language === 'ru' ? (prop.titleRu || prop.titleUz) : prop.titleUz}
                            </div>
                            <div className="text-[11px] text-brand-600 dark:text-brand-400 font-bold">
                              {formatPriceUzs(prop.priceUzs)}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{prop.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {prop.matchScore && (
                            <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {prop.matchScore}%
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 ml-10 p-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl w-fit shadow-2xs">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin" />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium animate-pulse">
                {language === 'en' ? 'AI is analyzing properties...' : language === 'ru' ? 'AI анализирует варианты...' : 'AI uylarni tahlil qilmoqda...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer & Quick Chips */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          {/* Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {quickPrompts.map((p, idx) => {
              const chipText = language === 'en' ? p.en : language === 'ru' ? p.ru : p.uz;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chipText)}
                  className="whitespace-nowrap text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0 active:scale-95"
                >
                  {chipText}
                </button>
              );
            })}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'What kind of home are you looking for? (e.g. 2-room in Novza...)'
                    : language === 'ru'
                    ? 'Какое жилье ищете? Например: 2-комнатная на Новзе...'
                    : 'Qanday uy qidiryapsiz? Masalan: Novzada 2 xonali...'
                }
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all flex items-center justify-center flex-shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
