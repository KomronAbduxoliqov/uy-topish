import React, { useState } from 'react';
import { X, User, Phone, Lock, CheckCircle2, Shield } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { UserRole, UserVerificationStatus } from '@uytop/shared-types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, language } = useAppStore();
  const t = translations[language];

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length < 9) {
      alert("Iltimos, to'liq telefon raqamingizni kiriting");
      return;
    }

    // Mock successful authentication for frontend instant experience
    const mockUser = {
      id: `usr-${Date.now()}`,
      phone,
      fullName: fullName || 'Rustam Karimov',
      role,
      verificationStatus: UserVerificationStatus.PHONE_VERIFIED,
      createdAt: new Date().toISOString()
    };

    setUser(mockUser, 'mock_jwt_token_' + Date.now());
    setIsAuthModalOpen(false);
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
            {mode === 'login' ? 'Tizimga kirish' : 'Ro\'yxatdan o\'tish'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' ? 'Telefon raqamingiz orqali kiring' : 'Yangi hisob oching va e\'lonlar boshqaring'}
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
            Kirish
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">To'liq ismingiz</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Telefon raqam</label>
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
            <label className="text-xs font-semibold text-slate-500 block mb-1">Parol</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Foydalanuvchi turi</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
              >
                <option value={UserRole.USER}>Oddiy izlovchi (Foydalanuvchi)</option>
                <option value={UserRole.OWNER}>Mulk egasi (Kvartira / Uy egasi)</option>
                <option value={UserRole.AGENT}>Ko'chmas mulk agenti (Rieltor)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
          >
            {mode === 'login' ? 'Tizimga kirish' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>
      </div>
    </div>
  );
};
