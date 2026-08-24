'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  Heart,
  Scale,
  User,
  ShieldAlert,
  Building2,
  TrendingUp,
  Bell,
  Calculator,
  ChevronDown,
  Menu,
  X,
  Clock,
  Bookmark,
  FileCheck,
  Search,
  MapPin,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';
import { translations, Language } from '../i18n';
import { UserRole, TransactionType } from '@uytop/shared-types';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { DarkModeToggle } from './DarkModeToggle';

export const Navbar: React.FC = () => {
  useKeyboardShortcuts();
  const router = useRouter();
  const pathname = usePathname();

  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    filters,
    setFilters,
    user,
    favorites,
    compareList,
    setIsWizardOpen,
    setIsAuthModalOpen,
    setIsCompareModalOpen,
    setIsModerationModalOpen,
    setIsAiDrawerOpen,
    setIsFavoritesModalOpen,
    setIsMortgageModalOpen,
    setIsValuationModalOpen,
    setIsAlertModalOpen,
    setIsRecentDrawerOpen,
    setIsAiHomeFinderOpen,
    setIsSavedProfilesOpen,
    setIsContractModalOpen,
    setContractProperty,
    logout
  } = useAppStore();

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (pathname) {
      const segments = pathname.split('/');
      if (segments[1] === 'uz' || segments[1] === 'ru' || segments[1] === 'en') {
        segments[1] = newLang;
        router.push(segments.join('/') || `/${newLang}`);
      } else {
        router.push(`/${newLang}`);
      }
    }
  };

  // Close tools dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-subtle transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Left: Brand Logo */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link href={`/${language}`} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-brand-500/20 group-hover:scale-105 group-hover:shadow-brand-500/30 transition-all flex-shrink-0 border border-slate-200/80 dark:border-slate-700 bg-slate-900">
              <img
                src="/logo-2d.jpg"
                alt="UyTop 2D Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Uy<span className="text-brand-600 dark:text-brand-400">Top</span>
                </span>
                <span className="text-[9px] uppercase font-extrabold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                  AI + Map
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 tracking-wide block mt-0.5">
                {language === 'en' ? 'Real Estate Platform' : language === 'ru' ? 'Платформа недвижимости' : "Ko'chmas mulk platformasi"}
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Middle: Smart AI Omnibar & Quick Categories (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-xl mx-4">
          {/* Quick AI Search Omnibar Trigger */}
          <button
            type="button"
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200/80 dark:border-slate-700/80 transition-all hover:shadow-sm hover:border-brand-300 dark:hover:border-brand-500 group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium truncate">
                {language === 'en'
                  ? 'Search by district, metro or ask AI...'
                  : language === 'ru'
                  ? 'Район, метро или запрос к AI...'
                  : "Tuman, metro yoki AI so'rov..."}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="flex items-center gap-1 text-[10px] font-extrabold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded-md border border-brand-200/80 dark:border-brand-800">
                <Sparkles className="w-3 h-3 text-brand-500" />
                <span>AI</span>
              </span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>

          {/* Quick Transaction Category Pills (Large screens) */}
          <div className="hidden xl:flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold flex-shrink-0">
            <button
              type="button"
              onClick={() => setFilters({ transactionType: TransactionType.RENT })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filters.transactionType === TransactionType.RENT
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.rent}
            </button>
            <button
              type="button"
              onClick={() => setFilters({ transactionType: TransactionType.SALE })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filters.transactionType === TransactionType.SALE
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.sale}
            </button>
            <button
              type="button"
              onClick={() => setFilters({ transactionType: TransactionType.DAILY })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filters.transactionType === TransactionType.DAILY
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.daily}
            </button>
          </div>
        </div>

        {/* 3. Right: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Post Listing Primary CTA */}
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow shadow-brand-600/20 transition-all flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.postListing}</span>
          </button>

          {/* Tools Menu Dropdown (Desktop) */}
          <div className="relative hidden md:block" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                isToolsOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{language === 'en' ? 'Tools' : language === 'ru' ? 'Инструменты' : 'Vositalar'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-2 z-50 animate-fadeIn">
                {/* AI Personal Home Finder */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAiHomeFinderOpen(true);
                    setIsToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-900 dark:text-brand-200 bg-brand-50/60 dark:bg-brand-950/60 hover:bg-brand-50 rounded-xl transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-brand-950 dark:text-white">
                      {language === 'en' ? 'AI Home Finder' : language === 'ru' ? 'AI Подбор жилья' : 'AI Shaxsiy Uy Topuvchi'}
                    </span>
                    <span className="text-[10px] text-brand-700 dark:text-brand-300 font-medium">
                      {language === 'en' ? 'Multi-turn chat & ranking' : language === 'ru' ? 'Диалог и подбор вариантов' : "Ko'p bosqichli suhbat & saralash"}
                    </span>
                  </div>
                </button>

                {/* Saved Profiles */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSavedProfilesOpen(true);
                    setIsToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors text-left mt-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">
                      {language === 'en' ? 'Saved Profiles' : language === 'ru' ? 'Сохраненные профили' : 'Saqlangan Profillar'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {language === 'en' ? 'Your preferences' : language === 'ru' ? 'Ваши критерии' : 'Sizning mezonlaringiz'}
                    </span>
                  </div>
                </button>

                {/* AI Valuation */}
                <button
                  type="button"
                  onClick={() => {
                    setIsValuationModalOpen(true);
                    setIsToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 rounded-xl transition-colors text-left mt-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">
                      {language === 'en' ? 'Price Valuation' : language === 'ru' ? 'Оценка недвижимости' : 'Mulkni Baholash'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {language === 'en' ? 'AI market analytics' : language === 'ru' ? 'AI анализ стоимости' : 'AI bozor narxi tahlili'}
                    </span>
                  </div>
                </button>

                {/* Mortgage Calculator */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMortgageModalOpen(true);
                    setIsToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 rounded-xl transition-colors text-left mt-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">
                      {language === 'en' ? 'Mortgage Calculator' : language === 'ru' ? 'Калькулятор ипотеки' : 'Ipoteka Kalkulyatori'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {language === 'en' ? 'Monthly payment rates' : language === 'ru' ? 'Ежемесячный платеж' : "Oylik to'lov va stavkalar"}
                    </span>
                  </div>
                </button>

                {/* Rental Contract Generator */}
                <button
                  type="button"
                  onClick={() => {
                    setContractProperty(null);
                    setIsContractModalOpen(true);
                    setIsToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-700 rounded-xl transition-colors text-left mt-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">
                      {language === 'en' ? 'Rental Contract Generator' : language === 'ru' ? 'Договор аренды (ijara.soliq)' : 'Ijara Shartnomasi Generatori'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {language === 'en' ? 'Legal contract & handover act' : language === 'ru' ? 'Договор и акт приема-передачи' : "Rasmiy shartnoma & dalolatnoma"}
                    </span>
                  </div>
                </button>

                {/* Telegram Alert */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAlertModalOpen(true);
                    setIsToolsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-700 rounded-xl transition-colors text-left mt-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">
                      {language === 'en' ? 'Telegram Alerts' : language === 'ru' ? 'Telegram Уведомления' : 'Telegram Xabarnoma'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {language === 'en' ? 'Instant updates on new deals' : language === 'ru' ? 'Мгновенные оповещения' : "Yangi e'lonlardan xabardorlik"}
                    </span>
                  </div>
                </button>

                {/* Moderation Queue if Admin */}
                {user && (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModerationModalOpen(true);
                      setIsToolsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 rounded-xl transition-colors text-left mt-1 border-t border-slate-100 dark:border-slate-700 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold">
                        {language === 'en' ? 'Moderation' : language === 'ru' ? 'Модерация' : 'Moderatsiya'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === 'en' ? 'Review queue' : language === 'ru' ? 'Очередь проверки' : 'Tekshiruv navbati'}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Compare (if active items) */}
          {compareList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="relative p-2 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
              title={t.compareProperties}
            >
              <Scale className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {compareList.length}
              </span>
            </button>
          )}

          {/* Favorites Button */}
          <button
            type="button"
            onClick={() => setIsFavoritesModalOpen(true)}
            className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title={t.savedFavorites}
          >
            <Heart className="w-4 h-4" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Currency Toggle (UZS / USD) */}
          <button
            type="button"
            onClick={() => setCurrency(currency === 'UZS' ? 'USD' : 'UZS')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors hidden sm:block"
            title="Valyutani o'zgartirish"
          >
            {currency === 'UZS' ? "SO'M" : '$ USD'}
          </button>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => handleLanguageChange('uz')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'uz' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('ru')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'ru' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
          </div>

          {/* Auth Button / Profile Avatar */}
          {user ? (
            <div className="flex items-center gap-2 pl-1.5 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-slate-400 hover:text-rose-600 font-semibold hidden md:block"
              >
                {language === 'en' ? 'Logout' : language === 'ru' ? 'Выйти' : 'Chiqish'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{t.login}</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
            aria-label="Menyu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-fadeIn shadow-lg">
          {/* Mobile AI Search Button */}
          <button
            type="button"
            onClick={() => {
              setIsAiDrawerOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 p-3 bg-brand-50 text-brand-800 rounded-xl text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>
              {language === 'en' ? 'Ask AI Assistant' : language === 'ru' ? 'Спросить у AI Ассистента' : 'AI Yordamchisiga aytish'}
            </span>
          </button>

          {/* Quick Smart Tools */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsValuationModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 hover:bg-indigo-50"
            >
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>{language === 'en' ? 'Valuation' : language === 'ru' ? 'Оценка' : 'Baholash'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMortgageModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 hover:bg-emerald-50"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'Mortgage' : language === 'ru' ? 'Калькулятор' : 'Kalkulyator'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setContractProperty(null);
                setIsContractModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 hover:bg-purple-50"
            >
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span>{language === 'en' ? 'Contract' : language === 'ru' ? 'Договор' : 'Shartnoma'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAlertModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 hover:bg-sky-50"
            >
              <Bell className="w-4 h-4 text-sky-600" />
              <span>{language === 'en' ? 'Telegram Bot' : language === 'ru' ? 'Telegram Бот' : 'Telegram Bot'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRecentDrawerOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 hover:bg-brand-50"
            >
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{language === 'en' ? 'Recent' : language === 'ru' ? 'Просмотренные' : "Ko'rilganlar"}</span>
            </button>
          </div>

          {/* Currency Toggle on Mobile */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <span>{language === 'en' ? 'Currency' : language === 'ru' ? 'Валюта' : 'Valyuta'}</span>
            <button
              type="button"
              onClick={() => setCurrency(currency === 'UZS' ? 'USD' : 'UZS')}
              className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-800"
            >
              {currency === 'UZS' ? "SO'M" : '$ USD'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
