'use client';

import React, { useState } from 'react';
import { X, User, Phone, Lock, Shield } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { apiClient } from '../../lib/api/client';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, language } = useAppStore();
  const t = translations[language];

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\+?998\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError("Telefon raqamini +998901234567 formatida kiriting");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = mode === 'register' ? { phone, password, fullName } : { phone, password };
      const response = await fetch(`/api/v1/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(typeof result?.message === 'string' ? result.message : "Kirishda xatolik yuz berdi");
        return;
      }

      setUser(result.data.user, result.data.accessToken);
      setPassword('');
      setIsAuthModalOpen(false);
    } catch {
      setError("Server bilan bog'lanib bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {isSubmitting
              ? (language === 'en' ? 'Processing...' : language === 'ru' ? 'Загрузка...' : 'Kutilmoqda...')
              : mode === 'login'
              ? (language === 'en' ? 'Sign In' : language === 'ru' ? 'Вход в аккаунт' : 'Tizimga kirish')
              : (language === 'en' ? 'Create Account' : language === 'ru' ? 'Регистрация' : "Ro'yxatdan o'tish")}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? (language === 'en' ? 'Enter with your phone number' : language === 'ru' ? 'Войдите по номеру телефона' : 'Telefon raqamingiz orqali kiring')
              : (language === 'en' ? 'Create an account to manage listings' : language === 'ru' ? 'Создайте аккаунт для управления объявлениями' : "Yangi hisob oching va e'lonlar boshqaring")}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {language === 'en' ? 'Sign In' : language === 'ru' ? 'Вход' : 'Kirish'}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {language === 'en' ? 'Register' : language === 'ru' ? 'Регистрация' : "Ro'yxatdan o'tish"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                {language === 'en' ? 'Full Name' : language === 'ru' ? 'Полное имя' : "To'liq ismingiz"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. John Doe' : language === 'ru' ? 'Например: Сардор Рахимов' : 'Masalan: Sardor Rahimov'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              {language === 'en' ? 'Phone Number' : language === 'ru' ? 'Номер телефона' : 'Telefon raqam'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              {language === 'en' ? 'Password' : language === 'ru' ? 'Пароль' : 'Parol'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={mode === 'register' ? 12 : undefined}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
          >
            {isSubmitting
              ? (language === 'en' ? 'Processing...' : language === 'ru' ? 'Загрузка...' : 'Kutilmoqda...')
              : mode === 'login'
              ? (language === 'en' ? 'Sign In' : language === 'ru' ? 'Войти' : 'Kirish')
              : (language === 'en' ? 'Create Account' : language === 'ru' ? 'Зарегистрироваться' : "Ro'yxatdan o'tish")}
          </button>
        </form>
      </div>
    </div>
  );
};
