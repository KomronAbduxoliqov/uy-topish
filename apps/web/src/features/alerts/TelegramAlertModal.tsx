'use client';

import React, { useState } from 'react';
import {
  X,
  Bell,
  Send,
  CheckCircle2,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const TelegramAlertModal: React.FC = () => {
  const { isAlertModalOpen, setIsAlertModalOpen, filters, language } = useAppStore();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!isAlertModalOpen) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
  };

  const botDeepLink = `https://t.me/uytop_bot?start=alert_${encodeURIComponent(
    (filters.district || 'toshkent') + '_' + (filters.rooms?.join('-') || 'all')
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur text-white flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {language === 'en' ? 'Telegram Alerts' : language === 'ru' ? 'Telegram Уведомления' : 'Telegram Bildirishnomalari'}
              </h3>
              <p className="text-xs text-sky-200">
                {language === 'en'
                  ? 'Be the first to know when new matching properties are listed'
                  : language === 'ru'
                  ? 'Узнавайте первыми о появлении новых подходящих объявлений'
                  : "Yangi mos e'lonlar chiqqanda birinchi bo'lib xabardor bo'ling"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAlertModalOpen(false);
              setIsSubscribed(false);
            }}
            className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {isSubscribed ? (
            <div className="text-center py-8 space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'en'
                  ? 'Alert successfully activated!'
                  : language === 'ru'
                  ? 'Уведомления успешно подключены!'
                  : 'Bildirishnoma muvaffaqiyatli yoqildi!'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                {language === 'en'
                  ? 'As soon as a new listing matches your search criteria, our Telegram bot will notify you immediately.'
                  : language === 'ru'
                  ? 'Как только появится объявление по вашим параметрам, бот мгновенно пришлет уведомление.'
                  : "Siz tanlagan parametrlar bo'yicha yangi e'lon qo'shilishi bilan Telegram botingizga tezkor xabar yuboramiz."}
              </p>
              <a
                href={botDeepLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'en' ? 'Open in Telegram Bot' : language === 'ru' ? 'Открыть в Telegram Боте' : 'Telegram Botda Ochish'}</span>
              </a>
            </div>
          ) : (
            <>
              {/* Selected Criteria Summary */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'en' ? 'Tracked Parameters:' : language === 'ru' ? 'Отслеживаемые параметры:' : 'Kuzatilayotgan parametrlar:'}
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    {filters.district
                      ? `${filters.district} ${language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}`
                      : (language === 'en' ? 'All districts' : language === 'ru' ? 'Все районы' : 'Barcha tumanlar')}
                  </span>
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {filters.transactionType === 'RENT'
                      ? (language === 'en' ? 'Rent' : language === 'ru' ? 'Аренда' : 'Ijara')
                      : (language === 'en' ? 'Sale' : language === 'ru' ? 'Продажа' : 'Sotuv')}
                  </span>
                  {filters.rooms && filters.rooms.length > 0 && (
                    <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {filters.rooms.join(', ')} {language === 'en' ? 'room' : language === 'ru' ? 'комн.' : 'xonali'}
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      ≤ {(Number(filters.maxPrice) / 1000000).toFixed(0)} {language === 'en' ? 'M UZS' : language === 'ru' ? 'млн сум' : "mln so'm"}
                    </span>
                  )}
                </div>
              </div>

              {/* Telegram Connect CTA */}
              <div className="space-y-3">
                <a
                  href={botDeepLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsSubscribed(true)}
                  className="w-full flex items-center justify-center gap-2 p-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {language === 'en'
                      ? '1-Click Connect with Telegram Bot'
                      : language === 'ru'
                      ? 'Подключить через Telegram Бот в 1 клик'
                      : '1-Tugma bilan Telegram Bot orqali ulanish'}
                  </span>
                </a>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">
                    {language === 'en' ? 'or' : language === 'ru' ? 'или' : 'yoki'}
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                      {language === 'en'
                        ? 'Telegram Username or Phone Number'
                        : language === 'ru'
                        ? 'Telegram Юзернейм или Номер телефона'
                        : 'Telegram Username yoki Telefon raqam'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@username yoki +998 90 123-45-67"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    {language === 'en' ? 'Activate Subscription' : language === 'ru' ? 'Активировать подписку' : 'Obunani faollashtirish'}
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span>
                  {language === 'en'
                    ? 'No spam. You can stop notifications anytime in bot.'
                    : language === 'ru'
                    ? 'Без спама. Можно отключить в любой момент в боте.'
                    : "Spam bo'lmaydi. Istalgan vaqtda bot orqali to'xtatishingiz mumkin."}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
