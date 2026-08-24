'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Train,
  CheckCircle2,
  ShieldCheck,
  Heart,
  ThumbsDown,
  Eye,
  Check,
  Scale
} from 'lucide-react';
import { PropertyRecommendation, VerificationTier } from '@uytop/shared-types';
import { useAppStore } from '../../store/useAppStore';
import { formatNumber } from '../../lib/utils/formatters';

interface Props {
  recommendation: PropertyRecommendation;
  rankIndex: number;
  onFeedback?: (propertyId: string, feedbackType: string) => void;
}

export const AiRecommendationCard: React.FC<Props> = ({
  recommendation,
  rankIndex,
  onFeedback
}) => {
  const {
    property,
    matchScore,
    matchReasons,
    estimatedWalkingMinutes,
    distanceToWorkKm,
    distanceToUniKm
  } = recommendation;

  const {
    currency,
    language,
    setActivePropertyId,
    favorites,
    toggleFavorite,
    compareList,
    toggleCompare,
    setIsAiHomeFinderOpen
  } = useAppStore();

  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);

  const isFavorited = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);

  const coverImage = property.images && property.images.length > 0
    ? property.images[0].originalUrl
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  const formatPrice = () => {
    if (currency === 'USD') {
      const usd = property.priceUsd > 0 ? property.priceUsd : Math.round(property.priceUzs / 12650);
      return `$${formatNumber(usd)}`;
    }
    return `${formatNumber(property.priceUzs)} ${language === 'en' ? 'UZS' : language === 'ru' ? 'сум' : "so'm"}`;
  };

  const handleFeedbackClick = (type: string) => {
    setFeedbackGiven(type);
    if (onFeedback) {
      onFeedback(property.id, type);
    }
  };

  const title = language === 'en'
    ? (property.titleEn || property.titleUz)
    : language === 'ru'
    ? (property.titleRu || property.titleUz)
    : property.titleUz;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-card transition-all duration-200 overflow-hidden flex flex-col sm:flex-row group">
      {/* Left Thumbnail with Ranking Badge */}
      <div className="relative w-full sm:w-48 aspect-[16/10] sm:aspect-auto overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Ranking Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
          <span>#{rankIndex + 1}</span>
          <span>•</span>
          <span className="text-emerald-400">
            {matchScore}% {language === 'en' ? 'match' : language === 'ru' ? 'совпадение' : 'mos'}
          </span>
        </div>

        {/* Inspected Badge */}
        {property.verificationTier === VerificationTier.INSPECTED && (
          <div className="absolute bottom-2 left-2 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3" />
            <span>{language === 'en' ? 'Verified' : language === 'ru' ? 'Проверено' : 'Tekshirilgan'}</span>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Specs Header */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {formatPrice()}
              {property.transactionType === 'RENT' && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                  {language === 'en' ? '/ mo' : language === 'ru' ? '/ мес' : '/ oy'}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {property.rooms} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'} • {property.areaSqm} m²
            </span>
          </div>

          {/* Title */}
          <h4
            onClick={() => setActivePropertyId(property.id)}
            className="font-extrabold text-slate-800 dark:text-slate-100 text-sm line-clamp-1 mb-1.5 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors"
          >
            {title}
          </h4>

          {/* Location & Metro */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {property.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}
              </span>
            </span>

            {property.nearestMetroStation && (
              <span className="flex items-center gap-1 text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md font-semibold border border-brand-200/60 dark:border-brand-800/60">
                <Train className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>
                  {property.nearestMetroStation} ({estimatedWalkingMinutes || 5} {language === 'en' ? 'min' : language === 'ru' ? 'мин' : 'daqiqa'})
                </span>
              </span>
            )}

            {distanceToWorkKm && (
              <span className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
                {language === 'en' ? `${distanceToWorkKm} km to work` : language === 'ru' ? `${distanceToWorkKm} км до работы` : `Ishingizga ${distanceToWorkKm} km`}
              </span>
            )}
          </div>

          {/* Why Match / Nega mos? */}
          {matchReasons && matchReasons.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-700/80 rounded-xl p-2.5 mb-3 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>
                  {language === 'en' ? 'Why it matches your search:' : language === 'ru' ? 'Почему это подходит вам:' : 'Nega aynan sizga mos:'}
                </span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                {matchReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons & Feedback */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
          {/* User Feedback */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {feedbackGiven ? (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {language === 'en' ? 'Feedback recorded' : language === 'ru' ? 'Отзыв принят' : 'Fikringiz qabul qilindi'}
              </span>
            ) : (
              <>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {language === 'en' ? 'Helpful match?' : language === 'ru' ? 'Подходит?' : 'Mos keldimi?'}
                </span>
                <button
                  type="button"
                  onClick={() => handleFeedbackClick('LIKE')}
                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                  title={language === 'en' ? 'Like' : language === 'ru' ? 'Нравится' : 'Menga yoqdi'}
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedbackClick('TOO_EXPENSIVE')}
                  className="px-2 py-0.5 text-[11px] hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-700 dark:hover:text-rose-300 text-slate-500 dark:text-slate-400 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
                  title={language === 'en' ? 'Too expensive' : language === 'ru' ? 'Слишком дорого' : 'Qimmatroq'}
                >
                  {language === 'en' ? 'Expensive' : language === 'ru' ? 'Дорого' : 'Qimmat'}
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedbackClick('DISLIKE')}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                  title={language === 'en' ? 'Dislike' : language === 'ru' ? 'Не подходит' : 'Mos emas'}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Card Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => toggleCompare(property.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                isCompared
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title={language === 'en' ? 'Compare' : language === 'ru' ? 'Сравнить' : 'Solishtirish'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(property.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                isFavorited
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title={language === 'en' ? 'Save' : language === 'ru' ? 'Сохранить' : 'Saqlash'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePropertyId(property.id);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Details' : language === 'ru' ? 'Подробнее' : 'Batafsil'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
