'use client';

import React from 'react';
import {
  Building2,
  Sparkles,
  Calculator,
  TrendingUp,
  Bell,
  Heart,
  Scale,
  ShieldCheck,
  Send,
  Phone,
  Mail,
  MapPin,
  Flag,
  HelpCircle,
  Bookmark
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TASHKENT_DISTRICTS } from '@uytop/shared-types';

export const Footer: React.FC = () => {
  const {
    setFilters,
    setIsAiDrawerOpen,
    setIsMortgageModalOpen,
    setIsValuationModalOpen,
    setIsAlertModalOpen,
    setIsFavoritesModalOpen,
    setIsCompareModalOpen,
    setIsAiHomeFinderOpen,
    setIsSavedProfilesOpen,
    language
  } = useAppStore();

  const handleDistrictClick = (districtName: string) => {
    setFilters({ district: districtName });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Info (Col 1-2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-brand-500/20 flex-shrink-0 border border-slate-700 bg-slate-900">
                <img
                  src="/logo-2d.jpg"
                  alt="UyTop 2D Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Uy<span className="text-brand-400">Top</span>
                <span className="text-[10px] uppercase font-bold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded border border-brand-500/30">
                  AI + Map
                </span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {language === 'en'
                ? 'Modern Uzbekistan real estate platform. Artificial intelligence, interactive map, verified listings and mortgage calculations all in one place.'
                : language === 'ru'
                ? 'Современная платформа недвижимости Узбекистана. Искусственный интеллект, интерактивная карта, проверенные объявления и ипотечные расчеты в одном месте.'
                : "O'zbekistonning zamonaviy ko'chmas mulk platformasi. Sun'iy intellekt, interaktiv xarita, tekshirilgan e'lonlar va ipoteka hisob-kitoblari bitta joyda."}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="https://t.me/uytop_uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white transition-colors text-xs font-semibold text-sky-400 border border-slate-700/60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Telegram Bot / Channel' : language === 'ru' ? 'Telegram Бот / Канал' : 'Telegram Bot / Kanal'}</span>
              </a>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-semibold text-emerald-400 border border-slate-700/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Verified listings' : language === 'ru' ? 'Проверенные объекты' : "Tekshirilgan e'lonlar"}</span>
              </div>
            </div>
          </div>

          {/* Tashkent Districts (Col 3) */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              {language === 'en' ? 'Tashkent Districts' : language === 'ru' ? 'Районы Ташкента' : 'Toshkent Tumanlari'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {TASHKENT_DISTRICTS.slice(0, 6).map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => handleDistrictClick(d.nameUz)}
                    className="hover:text-brand-400 transition-colors text-left"
                  >
                    {language === 'en' ? `${d.nameEn || d.nameUz} district` : language === 'ru' ? `${d.nameRu} район` : `${d.nameUz} tumani`}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Districts (Col 4) */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              {language === 'en' ? 'Other Areas' : language === 'ru' ? 'Другие районы' : 'Boshqa Hududlar'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {TASHKENT_DISTRICTS.slice(6, 12).map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => handleDistrictClick(d.nameUz)}
                    className="hover:text-brand-400 transition-colors text-left"
                  >
                    {language === 'en' ? `${d.nameEn || d.nameUz} district` : language === 'ru' ? `${d.nameRu} район` : `${d.nameUz} tumani`}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Smart Tools & Support (Col 5) */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              {language === 'en' ? 'Smart Tools & Help' : language === 'ru' ? 'Инструменты и Помощь' : 'Aqlli Vositalar & Yordam'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setIsAiHomeFinderOpen(true)}
                  className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-bold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>{language === 'en' ? 'AI Home Finder' : language === 'ru' ? 'AI Подбор жилья' : 'AI Shaxsiy Uy Topuvchi'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsSavedProfilesOpen(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Saved Profiles' : language === 'ru' ? 'Сохраненные профили' : 'Saqlangan Profillar'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-brand-400 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>{language === 'en' ? 'AI Quick Search' : language === 'ru' ? 'Быстрый AI Поиск' : 'AI Tezkor Qidiruv'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsMortgageModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'en' ? 'Mortgage Calculator' : language === 'ru' ? 'Ипотечный Калькулятор' : 'Ipoteka Kalkulyatori'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsValuationModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{language === 'en' ? 'AI Price Valuation' : language === 'ru' ? 'AI Оценка Недвижимости' : 'AI Mulkni Baholash'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-sky-400" />
                  <span>{language === 'en' ? 'Telegram Alerts' : language === 'ru' ? 'Telegram Уведомления' : 'Telegram Bildirishnomalar'}</span>
                </button>
              </li>
              <li className="pt-1 border-t border-slate-800">
                <a
                  href="https://t.me/uytop_support"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Support Center' : language === 'ru' ? 'Служба поддержки' : "Qo'llab-quvvatlash xizmati"}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            {language === 'en'
              ? '© 2026 UyTop.uz — Real estate platform in Uzbekistan powered by AI and Interactive Map.'
              : language === 'ru'
              ? '© 2026 UyTop.uz — Платформа недвижимости в Узбекистане с AI и картой.'
              : "© 2026 UyTop.uz — O'zbekistonda AI va Xarita orqali ko'chmas mulk platformasi."}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="hover:text-slate-400 cursor-pointer">
              {language === 'en' ? 'Terms of Service' : language === 'ru' ? 'Условия использования' : 'Foydalanish shartlari'}
            </span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">
              {language === 'en' ? 'Privacy Policy' : language === 'ru' ? 'Политика конфиденциальности' : 'Maxfiylik siyosati'}
            </span>
            <span>•</span>
            <span className="text-slate-400 font-semibold">Tashkent, Uzbekistan 🇺🇿</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
