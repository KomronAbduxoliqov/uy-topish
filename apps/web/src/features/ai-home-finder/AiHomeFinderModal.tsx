'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bookmark,
  RotateCcw,
  MapPin,
  Train,
  CheckCircle2,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiClient } from '../../lib/api/client';
import { AiPreferenceSummary } from './AiPreferenceSummary';
import { AiRecommendationCard } from './AiRecommendationCard';
import { AiQuickRefinement } from './AiQuickRefinement';
import {
  AiFinderMessage,
  PropertyRecommendation,
  UserPreferenceModel
} from '@uytop/shared-types';

export const AiHomeFinderModal: React.FC = () => {
  const {
    isAiHomeFinderOpen,
    setIsAiHomeFinderOpen,
    language,
    aiFinderMessages,
    addAiFinderMessage,
    resetAiFinderMessages,
    aiFinderPreferences,
    setAiFinderPreferences,
    aiFinderRecommendations,
    setAiFinderRecommendations,
    setProperties,
    showToast
  } = useAppStore();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAiHomeFinderOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiFinderMessages, isAiHomeFinderOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: AiFinderMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    addAiFinderMessage(userMsg);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await apiClient.aiHomeFinderChat({
        message: text,
        history: aiFinderMessages,
        currentPreferences: aiFinderPreferences,
        language: language
      });

      if (response.updatedPreferences) {
        setAiFinderPreferences(response.updatedPreferences);
      }

      if (response.recommendations && response.recommendations.length > 0) {
        setAiFinderRecommendations(response.recommendations);
        setProperties(response.recommendations.map((r: PropertyRecommendation) => r.property));
      }

      const botReply = (response.message && (typeof response.message === 'string' ? response.message : response.message.content)) || (response as any).reply || (language === 'en' ? 'Here are the matching options:' : language === 'ru' ? 'Вот подходящие варианты:' : 'Mos variantlar topildi:');

      const assistantMsg: AiFinderMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: botReply,
        clarificationOptions: (response as any).clarificationOptions,
        recommendations: response.recommendations,
        alternativeSuggestions: response.alternativeSuggestions,
        quickRefinements: (response as any).quickRefinements,
        timestamp: new Date().toISOString()
      };
      addAiFinderMessage(assistantMsg);
    } catch (err) {
      console.error(err);
      const errorMsg: AiFinderMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        text:
          language === 'en'
            ? 'Sorry, there was an error processing your request. Please try again.'
            : language === 'ru'
            ? 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте снова.'
            : "Kechirasiz, so'rovingizni qayta ishlashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
        timestamp: new Date().toISOString()
      };
      addAiFinderMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinement = (action: string) => {
    if (action === 'cheaper' || action === 'CHEAPER_OPTIONS') {
      handleSendMessage(
        language === 'en'
          ? 'Show me more affordable options'
          : language === 'ru'
          ? 'Покажи варианты подешевле'
          : "Menga biroz arzonroq variantlarni ko'rsat"
      );
    } else if (action === 'closer_metro' || action === 'CLOSER_TO_METRO') {
      handleSendMessage(
        language === 'en'
          ? 'Only properties within 5-10 minutes walk to metro'
          : language === 'ru'
          ? 'Только ближе к метро (5-10 минут пешком)'
          : "Faqat metroga piyoda 5-10 daqiqalik uylar bo'lsin"
      );
    } else if (action === 'more_rooms' || action === 'INCREASE_BUDGET_500K') {
      handleSendMessage(
        language === 'en'
          ? 'Increase budget by 500k and show better apartments'
          : language === 'ru'
          ? 'Увеличь бюджет на 500 тыс. и покажи варианты'
          : "Budjetni 500 ming oshirib yaxshiroq variantlarni ko'rsat"
      );
    } else if (action === 'verified_only' || action === 'ONLY_FURNISHED') {
      handleSendMessage(
        language === 'en'
          ? 'Filter only fully furnished and verified properties'
          : language === 'ru'
          ? 'Только с мебелью и проверенные варианты'
          : "Faqat mebelli va tekshirilgan uylarni sarala"
      );
    } else if (action === 'EXPAND_RADIUS') {
      handleSendMessage(
        language === 'en'
          ? 'Expand search radius to neighboring areas'
          : language === 'ru'
          ? 'Расширь радиус поиска'
          : "Qidiruv radiusini kengaytirib ko'rsat"
      );
    }
  };

  const handleSaveSearchProfile = async () => {
    try {
      await apiClient.saveSearchProfile({
        name:
          language === 'en'
            ? `Search: ${aiFinderPreferences?.district || 'Tashkent'} ${aiFinderPreferences?.rooms || 2}-room`
            : language === 'ru'
            ? `Поиск: ${aiFinderPreferences?.district || 'Ташкент'} ${aiFinderPreferences?.rooms || 2}-комн.`
            : `${aiFinderPreferences?.district || 'Toshkent'} ${aiFinderPreferences?.rooms || 2} xonali qidiruv`,
        preferences: aiFinderPreferences,
        isActiveAlert: true
      });
      setSaveSuccess(true);
      showToast(
        language === 'en'
          ? 'Search profile saved successfully! We will notify you about new matches.'
          : language === 'ru'
          ? 'Профиль поиска сохранен! Мы уведомим вас о новых объявлениях.'
          : "Qidiruv profili muvaffaqiyatli saqlandi! Yangi e'lonlar chiqsa xabar beramiz.",
        'success'
      );
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAiHomeFinderOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] border border-slate-200 dark:border-slate-800">
        {/* 1. Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                  {language === 'en' ? 'AI Personal Home Finder' : language === 'ru' ? 'AI Персональный подбор' : 'AI Shaxsiy Uy Topuvchi'}
                </h3>
                <span className="bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Multi-Turn AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {language === 'en'
                  ? 'Speak in your preferred language — AI finds and ranks verified listings in real time'
                  : language === 'ru'
                  ? 'Опишите своими словами — AI найдет лучшие варианты из базы данных'
                  : "O'zingizga qulay tilda ayting — AI eng mos uylarni real bazadan topib saralaydi"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Save Profile Button */}
            {aiFinderRecommendations.length > 0 && (
              <button
                type="button"
                onClick={handleSaveSearchProfile}
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold transition-colors border border-brand-200 dark:border-brand-800"
                title={language === 'en' ? 'Save search profile' : language === 'ru' ? 'Сохранить профиль поиска' : 'Qidiruv profilini saqlash'}
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {language === 'en'
                    ? (saveSuccess ? 'Saved!' : 'Save Profile')
                    : language === 'ru'
                    ? (saveSuccess ? 'Сохранено!' : 'Сохранить профиль')
                    : (saveSuccess ? 'Saqlandi!' : 'Profilni saqlash')}
                </span>
              </button>
            )}

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                resetAiFinderMessages();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={language === 'en' ? 'Restart' : language === 'ru' ? 'Начать заново' : 'Qaytadan boshlash'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsAiHomeFinderOpen(false);
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={language === 'en' ? 'Close' : language === 'ru' ? 'Закрыть' : 'Yopish'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Interactive Main Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50">
          {/* Active Extracted Preferences Bar */}
          <AiPreferenceSummary
            preferences={aiFinderPreferences}
            onClearField={(field) => {
              const updated = { ...aiFinderPreferences };
              delete updated[field];
              setAiFinderPreferences(updated);
            }}
          />

          {/* Conversation Messages */}
          {aiFinderMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm text-sm font-semibold'
                    : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl rounded-tl-xs p-4 shadow-subtle text-slate-800 dark:text-slate-100'
                }`}
              >
                <div>
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                    {msg.text}
                  </p>
                </div>

                {/* Clarification Option Chips */}
                {msg.clarificationOptions && msg.clarificationOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.clarificationOptions.map((opt: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(opt)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-700 dark:hover:text-brand-300 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition-all shadow-xs active:scale-95"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Property Recommendations Grid */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {msg.recommendations.map((rec: PropertyRecommendation, idx: number) => (
                      <AiRecommendationCard
                        key={rec.property.id}
                        recommendation={rec}
                        rankIndex={idx}
                        onFeedback={async (propId, fType) => {
                          await apiClient.aiHomeFinderFeedback({
                            propertyId: propId,
                            feedbackType: fType,
                            currentPreferences: aiFinderPreferences
                          });
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Grounded Alternative Suggestions if 0 Matches */}
                {msg.alternativeSuggestions && msg.alternativeSuggestions.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-300 font-semibold space-y-1">
                    <span className="font-bold block">
                      {language === 'en' ? 'Recommended alternatives:' : language === 'ru' ? 'Рекомендованные варианты:' : 'Tavsiya qilingan variantlar:'}
                    </span>
                    {msg.alternativeSuggestions.map((alt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                        <span>{alt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick 1-Click Refinements */}
                {msg.quickRefinements && (
                  <AiQuickRefinement
                    onSelectRefinement={handleRefinement}
                    isLoading={isLoading}
                  />
                )}
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing / Searching Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-pulse" />
                <span>
                  {language === 'en'
                    ? 'AI is matching and scoring properties from database...'
                    : language === 'ru'
                    ? 'AI подбирает и оценивает варианты из базы данных...'
                    : "AI ma'lumotlar bazasidan mos uylarni saralamoqda..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Input Footer Bar with Voice */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
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
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'What kind of property are you looking for? (e.g. 2-room in Novza up to 4M...)'
                    : language === 'ru'
                    ? 'Какое жилье ищете? (Например: 2-комнатная на Новзе до 4 млн...)'
                    : 'Qanday uy qidiryapsiz? (Masalan: Novzada 4 mln gacha 2 xonali...)'
                }
                disabled={isLoading}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex-shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'Send' : language === 'ru' ? 'Отправить' : 'Yuborish'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
