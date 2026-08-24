'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiClient } from '../../lib/api/client';
import { PropertyReportReason } from '@uytop/shared-types';

const REPORT_REASONS: Array<{ value: PropertyReportReason; labelUz: string; labelRu: string; labelEn: string }> = [
  { value: 'SCAM', labelUz: "Firibgarlik / Oldindan zakalat talab qilish", labelRu: "Мошенничество / Требование предоплаты", labelEn: "Scam / Advance deposit fraud" },
  { value: 'FAKE_PROPERTY', labelUz: "Soxta e'lon / Rasmlar boshqa uydan", labelRu: "Фейковое объявление / Чужие фото", labelEn: "Fake listing / Misleading photos" },
  { value: 'WRONG_PRICE', labelUz: "Narx noto'g'ri ko'rsatilgan", labelRu: "Неверная цена", labelEn: "Incorrect price" },
  { value: 'WRONG_LOCATION', labelUz: "Manzil / Joylashuv noto'g'ri", labelRu: "Неверный адрес / локация", labelEn: "Incorrect address / location" },
  { value: 'DUPLICATE', labelUz: "Boshqa e'lonning takrori (Dublikat)", labelRu: "Повтор существующего объявления", labelEn: "Duplicate listing" },
  { value: 'ALREADY_RENTED', labelUz: "Allaqachon topshirilgan / sotilgan", labelRu: "Уже сдано / продано", labelEn: "Already rented / sold" },
  { value: 'SUSPICIOUS_OWNER', labelUz: "Mulkdor shubhali xatti-harakati", labelRu: "Подозрительное поведение владельца", labelEn: "Suspicious landlord behavior" },
  { value: 'OTHER', labelUz: "Boshqa sabab", labelRu: "Другая причина", labelEn: "Other reason" },
];

export const ReportListingModal: React.FC = () => {
  const { reportingPropertyId, setReportingPropertyId, language } = useAppStore();

  const [selectedReason, setSelectedReason] = useState<PropertyReportReason>('SCAM');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!reportingPropertyId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await apiClient.reportProperty(reportingPropertyId, {
        reason: selectedReason,
        description: description.trim() || undefined,
        reporterPhone: phone.trim() || undefined
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReportingPropertyId(null);
        setDescription('');
        setPhone('');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
        (language === 'en'
          ? "An error occurred while submitting the report"
          : language === 'ru'
          ? "Ошибка при отправке жалобы"
          : "Shikoyatni yuborishda xatolik yuz berdi")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-white to-slate-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                {language === 'en' ? 'Report Listing' : language === 'ru' ? 'Пожаловаться на объявление' : "E'lon ustidan shikoyat qilish"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {language === 'en'
                  ? 'Help us keep the UyTop community safe and verified'
                  : language === 'ru'
                  ? 'Помогите сохранить безопасность сообщества UyTop'
                  : 'UyTop hamjamiyatini xavfsiz saqlashga yordam bering'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setReportingPropertyId(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              {language === 'en' ? 'Report submitted successfully!' : language === 'ru' ? 'Жалоба принята!' : 'Shikoyatingiz qabul qilindi!'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {language === 'en'
                ? 'Our moderation team will review this listing immediately. Thank you for your contribution!'
                : language === 'ru'
                ? 'Наши модераторы оперативно проверят это объявление. Спасибо за вашу помощь!'
                : "Moderatorlarimiz ushbu e'lonni zudlik bilan tekshirib chiqishadi. Xavfsizlikka qo'shgan hissangiz uchun rahmat!"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Reasons List */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-2">
                {language === 'en' ? 'Select main reason:' : language === 'ru' ? 'Выберите основную причину:' : 'Asosiy sababni tanlang:'}
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => {
                  const label = language === 'en' ? r.labelEn : language === 'ru' ? r.labelRu : r.labelUz;
                  return (
                    <label
                      key={r.value}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        selectedReason === r.value
                          ? 'bg-rose-50/70 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                          : 'bg-slate-50/60 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.value}
                        checked={selectedReason === r.value}
                        onChange={() => setSelectedReason(r.value)}
                        className="text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                {language === 'en' ? 'Additional details (optional):' : language === 'ru' ? 'Дополнительный комментарий (необязательно):' : "Qo'shimcha izoh (ixtiyoriy):"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Provide more information about the issue...'
                    : language === 'ru'
                    ? 'Опишите подозрительные детали...'
                    : "Shubhali holat haqida batafsilroq ma'lumot qoldiring..."
                }
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Optional Phone Number */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                {language === 'en' ? 'Your phone number (optional):' : language === 'ru' ? 'Ваш телефон (необязательно):' : "Telefon raqamingiz (bog'lanish uchun, ixtiyoriy):"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportingPropertyId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {language === 'en' ? 'Cancel' : language === 'ru' ? 'Отмена' : 'Bekor qilish'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'en' ? 'Submitting...' : language === 'ru' ? 'Отправка...' : 'Yuborilmoqda...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Submit Report' : language === 'ru' ? 'Отправить жалобу' : 'Shikoyatni yuborish'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

