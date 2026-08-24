'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileCheck,
  Flag,
  Sparkles,
  Search,
  Eye,
  Check,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiClient } from '../../lib/api/client';
import { VerificationTier } from '@uytop/shared-types';
import { formatPriceUzs } from '../../lib/utils/formatters';

export const ModerationModal: React.FC = () => {
  const { isModerationModalOpen, setIsModerationModalOpen, properties, setProperties, language } = useAppStore();

  const [activeTab, setActiveTab] = useState<'fraud_queue' | 'all_listings'>('fraud_queue');
  const [fraudItems, setFraudItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isModerationModalOpen) {
      loadFraudQueue();
    }
  }, [isModerationModalOpen]);

  const loadFraudQueue = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getFraudQueue({});
      if (res && res.items) {
        setFraudItems(res.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAction = async (assessmentId: string, action: string, message: string) => {
    try {
      await apiClient.reviewRiskAssessment(assessmentId, { action });
      setActionSuccessMessage(message);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      loadFraudQueue();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isModerationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  {language === 'en'
                    ? 'UyTop Moderation & Fraud Protection'
                    : language === 'ru'
                    ? 'UyTop Модерация и Защита от Мошенничества'
                    : 'UyTop Moderatsiya & Firibgarlikdan Himoya'}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Audit Logged
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'en'
                  ? 'AI risk signals and human moderation verification'
                  : language === 'ru'
                  ? 'Сигналы риска ИИ и ручная модерация'
                  : "Sun'iy intellekt xavf signallari va insoniy moderatsiya nazorati"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModerationModalOpen(false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={() => setActiveTab('fraud_queue')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'fraud_queue'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>
              {language === 'en' ? 'Fraud & Risk Queue' : language === 'ru' ? 'Очередь рисков' : 'Firibgarlik & Xavf Navbati'}
            </span>
            <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
              {fraudItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_listings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'all_listings'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4 text-brand-600" />
            <span>
              {language === 'en' ? 'All Listings & Verification' : language === 'ru' ? 'Все объявления и верификация' : "Barcha E'lonlar & Verifikatsiya"}
            </span>
          </button>
        </div>

        {/* Action Success Toast */}
        {actionSuccessMessage && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {activeTab === 'fraud_queue' ? (
            <div>
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {language === 'en' ? 'Loading risk queue...' : language === 'ru' ? 'Загрузка очереди рисков...' : 'Xavf navbati yuklanmoqda...'}
                  </span>
                </div>
              ) : fraudItems.length === 0 ? (
                <div className="py-12 text-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    {language === 'en' ? 'No suspicious listings found' : language === 'ru' ? 'Подозрительных объявлений нет' : "Shubhali e'lonlar mavjud emas"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'en'
                      ? 'All active properties meet platform security guidelines.'
                      : language === 'ru'
                      ? 'Все объявления соответствуют критериям безопасности.'
                      : "Barcha e'lonlar xavfsizlik mezonlariga to'liq javob beradi."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fraudItems.map(({ assessment, property, reportsCount }) => {
                    const isHigh = assessment.riskLevel === 'HIGH' || assessment.riskLevel === 'CRITICAL';
                    const propTitle = language === 'en' ? (property?.titleEn || property?.titleUz) : language === 'ru' ? (property?.titleRu || property?.titleUz) : property?.titleUz;
                    return (
                      <div
                        key={assessment.id}
                        className={`p-5 rounded-3xl border transition-all ${
                          isHigh ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800' : 'bg-amber-50/30 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {/* Top Bar: Property Title, Risk Badge & Price */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={property?.images?.[0]?.originalUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80'}
                              alt={propTitle || ''}
                              className="w-16 h-16 object-cover rounded-2xl flex-shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                    isHigh
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-amber-500 text-white'
                                  }`}
                                >
                                  {assessment.riskLevel} ({assessment.riskScore}/100 {language === 'en' ? 'risk' : language === 'ru' ? 'риск' : 'xavf'})
                                </span>
                                {reportsCount > 0 && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                                    <Flag className="w-2.5 h-2.5" />
                                    {reportsCount} {language === 'en' ? 'reports' : language === 'ru' ? 'жалоб' : 'ta shikoyat'}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{propTitle}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {property?.district} • {formatPriceUzs(property?.priceUzs || 0)} • {language === 'en' ? 'Owner:' : language === 'ru' ? 'Владелец:' : 'Egasi:'} {property?.ownerPhone || '+99890...'}
                              </p>
                            </div>
                          </div>

                          {/* Quick Moderator Action Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleReviewAction(assessment.id, 'APPROVE', language === 'en' ? 'Listing approved as verified safe.' : language === 'ru' ? 'Объявление одобрено.' : "E'lon tasdiqlandi va xavfsiz deb belgilandi.")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Approve' : language === 'ru' ? 'Одобрить' : 'Tasdiqlash'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewAction(assessment.id, 'REQUEST_VERIFICATION', language === 'en' ? 'Requested ownership documents.' : language === 'ru' ? 'Запрошены документы.' : "E'lon egasidan hujjat talab qilindi.")}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Request Docs' : language === 'ru' ? 'Запросить док.' : "Hujjat so'rash"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewAction(assessment.id, 'REJECT', language === 'en' ? 'Listing rejected and delisted.' : language === 'ru' ? 'Объявление отклонено.' : "E'lon rad etildi.")}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Reject' : language === 'ru' ? 'Отклонить' : 'Rad etish'}</span>
                            </button>
                          </div>
                        </div>

                        {/* AI Evidence Signals */}
                        {assessment.signals && assessment.signals.length > 0 && (
                          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>
                                {language === 'en'
                                  ? 'Detected Evidence & Risk Signals:'
                                  : language === 'ru'
                                  ? 'Выявленные факты и сигналы риска:'
                                  : 'Aniqlangan dalillar va xavf signallari:'}
                              </span>
                            </span>
                            {assessment.signals.map((sig: any, idx: number) => {
                              const signalMsg = language === 'en' ? (sig.messageEn || sig.messageUz) : language === 'ru' ? (sig.messageRu || sig.messageUz) : sig.messageUz;
                              return (
                                <div key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                                  <span>{signalMsg}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((p) => {
                const propTitle = language === 'en' ? (p.titleEn || p.titleUz) : language === 'ru' ? (p.titleRu || p.titleUz) : p.titleUz;
                return (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.originalUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80'}
                        alt={propTitle}
                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                      />
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{propTitle}</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.district} • {formatPriceUzs(p.priceUzs)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                            {language === 'en' ? 'Owner:' : language === 'ru' ? 'Владелец:' : 'Egasi:'} {p.ownerName || 'Mulk Egasi'} ({p.ownerPhone || '+99890...'})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {language === 'en' ? 'Tier:' : language === 'ru' ? 'Уровень:' : 'Daraja:'} {p.verificationTier}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setProperties(
                            properties.map((item) =>
                              item.id === p.id ? { ...item, verificationTier: VerificationTier.DOCS_VERIFIED } : item
                            )
                          );
                          setActionSuccessMessage(language === 'en' ? 'Ownership documents verified' : language === 'ru' ? 'Документы проверены' : "Hujjat tekshirildi va tasdiqlandi");
                          setTimeout(() => setActionSuccessMessage(null), 3000);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Verify Docs' : language === 'ru' ? 'Проверить док.' : 'Hujjatni tasdiqlash'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setProperties(
                            properties.map((item) =>
                              item.id === p.id ? { ...item, verificationTier: VerificationTier.INSPECTED } : item
                            )
                          );
                          setActionSuccessMessage(language === 'en' ? 'Marked as on-site inspected' : language === 'ru' ? 'Отмечено как проверено на месте' : "Ko'rikdan o'tkazildi");
                          setTimeout(() => setActionSuccessMessage(null), 3000);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Inspected' : language === 'ru' ? 'Проверено' : "Ko'rikdan o'tgan"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
