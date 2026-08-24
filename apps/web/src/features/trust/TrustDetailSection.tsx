'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Phone,
  FileCheck,
  Home,
  AlertTriangle,
  Flag,
  Check,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiClient } from '../../lib/api/client';
import { VerificationTier } from '@uytop/shared-types';

interface Props {
  propertyId: string;
  verificationTier?: VerificationTier;
  ownerPhone?: string;
}

export const TrustDetailSection: React.FC<Props> = ({
  propertyId,
  verificationTier = VerificationTier.UNVERIFIED,
  ownerPhone
}) => {
  const { setReportingPropertyId, language } = useAppStore();

  const [trustData, setTrustData] = useState<{
    phoneVerified: boolean;
    docsVerified: boolean;
    inspected: boolean;
    publicBadge: string;
    summaryUz: string;
    summaryRu: string;
    summaryEn?: string;
    verifiedDate?: string;
  } | null>(null);

  useEffect(() => {
    if (propertyId) {
      apiClient.getTrustDetails(propertyId).then((res) => {
        if (res) setTrustData(res as any);
      });
    }
  }, [propertyId]);

  const isInspected = verificationTier === VerificationTier.INSPECTED || trustData?.inspected;
  const isDocsVerified =
    verificationTier === VerificationTier.DOCS_VERIFIED || isInspected || trustData?.docsVerified;
  const isPhoneVerified = Boolean(ownerPhone) || trustData?.phoneVerified;

  return (
    <div className="p-5 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-subtle animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'en' ? 'Trust & Verification Details' : language === 'ru' ? 'Доверие и проверка' : "Ishonchlilik & Tekshiruv Ma'lumotlari"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'en'
                ? 'UyTop safe deals and transparent real estate verification system'
                : language === 'ru'
                ? 'Система безопасных сделок UyTop'
                : "UyTop xavfsiz bitimlar va shaffof ko'chmas mulk tizimi"}
            </p>
          </div>
        </div>

        {/* Report Button */}
        <button
          type="button"
          onClick={() => setReportingPropertyId(propertyId)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-bold transition-colors border border-slate-200/60 dark:border-slate-700"
          title={language === 'en' ? 'Report listing' : language === 'ru' ? 'Пожаловаться' : 'Shikoyat qilish'}
        >
          <Flag className="w-3 h-3" />
          <span>{language === 'en' ? 'Report' : language === 'ru' ? 'Пожаловаться' : 'Shikoyat'}</span>
        </button>
      </div>

      {/* Trust Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        {/* 1. Phone Verification */}
        <div
          className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
            isPhoneVerified
              ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isPhoneVerified ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[11px] font-extrabold text-slate-900 dark:text-white">
              {language === 'en' ? 'Phone Number' : language === 'ru' ? 'Номер телефона' : 'Telefon raqam'}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              {language === 'en' ? '✓ Verified' : language === 'ru' ? '✓ Подтвержден' : '✓ Tasdiqlangan'}
            </span>
          </div>
        </div>

        {/* 2. Documents Verification */}
        <div
          className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
            isDocsVerified
              ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-500'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDocsVerified ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[11px] font-extrabold text-slate-900 dark:text-white">
              {language === 'en' ? 'Documents' : language === 'ru' ? 'Документы' : 'Hujjatlar'}
            </span>
            <span className={`text-[10px] font-medium ${isDocsVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
              {isDocsVerified
                ? (language === 'en' ? '✓ Verified' : language === 'ru' ? '✓ Проверены' : '✓ Tekshirilgan')
                : (language === 'en' ? 'Pending' : language === 'ru' ? 'Ожидается' : 'Kutilmoqda')}
            </span>
          </div>
        </div>

        {/* 3. Physical Inspection */}
        <div
          className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
            isInspected
              ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-500'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isInspected ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
            <Home className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[11px] font-extrabold text-slate-900 dark:text-white">
              {language === 'en' ? 'On-site Inspection' : language === 'ru' ? 'Осмотр на месте' : "Joyida ko'rik"}
            </span>
            <span className={`text-[10px] font-medium ${isInspected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
              {isInspected
                ? (language === 'en' ? '✓ Inspected' : language === 'ru' ? '✓ Осмотрено лично' : "✓ Ko'rikdan o'tgan")
                : (language === 'en' ? 'Online listing' : language === 'ru' ? 'Онлайн объявление' : "Onlayn e'lon")}
            </span>
          </div>
        </div>
      </div>

      {/* Summary info box */}
      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
        {trustData
          ? (language === 'en'
              ? (trustData.summaryEn || trustData.summaryUz)
              : language === 'ru'
              ? trustData.summaryRu
              : trustData.summaryUz)
          : (language === 'en'
              ? 'This listing was posted by a verified phone number owner.'
              : language === 'ru'
              ? 'Объявление размещено с подтвержденного номера владельца.'
              : "E'lon e'lon egasining tasdiqlangan telefon raqami orqali joylashtirilgan.")}
      </p>
    </div>
  );
};
