import React from 'react';
import {
  Sparkles,
  PlusCircle,
  Heart,
  Scale,
  Globe,
  User,
  ShieldAlert,
  MapPin,
  Building2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n';
import { UserRole } from '@uytop/shared-types';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    user,
    favorites,
    compareList,
    setIsWizardOpen,
    setIsAuthModalOpen,
    setIsCompareModalOpen,
    setIsModerationModalOpen,
    setIsAiDrawerOpen,
    logout
  } = useAppStore();

  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:bg-brand-600 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Uy<span className="text-brand-600">Top</span>
                <span className="text-[10px] uppercase font-bold bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">UZ</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium leading-none hidden sm:block">AI & Xarita orqali uy topish</p>
            </div>
          </a>
        </div>

        {/* Center: AI Search Trigger Button */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-full text-sm font-medium transition-all border border-slate-200/60 hover:border-brand-300 group"
        >
          <Sparkles className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
          <span className="text-slate-500 font-normal">AI yordamchisiga ayting:</span>
          <span className="font-semibold text-slate-800">"Chilonzorda 2 xonali..."</span>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Post Listing Button */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow hover:shadow-brand-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.postListing}</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => {
              if (favorites.length === 0) {
                alert("Siz hali hech qanday e'lonni saqlamadingiz");
              }
            }}
            className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title={t.savedFavorites}
          >
            <Heart className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Compare */}
          {compareList.length > 0 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="relative p-2 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
              title={t.compareProperties}
            >
              <Scale className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {compareList.length}
              </span>
            </button>
          )}

          {/* Moderation Queue for Admin / Moderator */}
          {user && (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) && (
            <button
              onClick={() => setIsModerationModalOpen(true)}
              className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Moderatsiya paneli"
            >
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span className="hidden lg:inline">Moderatsiya</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-700">
            <button
              onClick={() => setLanguage('uz')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'uz' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'ru' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              RU
            </button>
          </div>

          {/* Auth Button / Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium"
              >
                Chiqish
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
