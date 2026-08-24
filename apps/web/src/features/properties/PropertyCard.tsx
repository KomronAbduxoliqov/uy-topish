'use client';

import React from 'react';
import {
  Heart,
  Scale,
  MapPin,
  Train,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Phone
} from 'lucide-react';
import { Property, VerificationTier } from '@uytop/shared-types';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { formatNumber } from '../../lib/utils/formatters';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const {
    language,
    favorites,
    toggleFavorite,
    compareList,
    toggleCompare,
    activePropertyId,
    setActivePropertyId,
    currency,
    showToast
  } = useAppStore();

  const t = translations[language];
  const isFavorited = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);
  const isActive = activePropertyId === property.id;

  const coverImage = property.images && property.images.length > 0
    ? property.images[0].originalUrl
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  const formatPrimaryPrice = () => {
    if (currency === 'USD') {
      const usd = property.priceUsd > 0 ? property.priceUsd : Math.round(property.priceUzs / 12650);
      return `$${formatNumber(usd)}`;
    }
    return `${formatNumber(property.priceUzs)} so'm`;
  };

  const formatSecondaryPrice = () => {
    if (currency === 'USD') {
      return `${formatNumber(property.priceUzs)} so'm`;
    }
    const usd = property.priceUsd > 0 ? property.priceUsd : Math.round(property.priceUzs / 12650);
    return `$${formatNumber(usd)}`;
  };

  const renderVerificationBadge = () => {
    if (property.verificationTier === VerificationTier.INSPECTED) {
      return (
        <span className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
          <ShieldCheck className="w-3 h-3" />
          <span>{language === 'en' ? 'Verified' : language === 'ru' ? 'Проверено' : "Ko'rikdan o'tgan"}</span>
        </span>
      );
    }
    if (property.verificationTier === VerificationTier.DOCS_VERIFIED) {
      return (
        <span className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
          <CheckCircle2 className="w-3 h-3" />
          <span>{language === 'en' ? 'Docs Checked' : language === 'ru' ? 'Документы проверены' : 'Hujjati tekshirilgan'}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => setActivePropertyId(property.id)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col will-change-transform active:scale-[0.99] smooth-card-render ${
        isActive
          ? 'ring-2 ring-brand-500 border-brand-500 shadow-md translate-y-[-2px]'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-card hover:-translate-y-0.5'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={coverImage}
          alt={property.titleUz}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges (Left) */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          {renderVerificationBadge()}
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
            {property.transactionType === 'RENT' ? t.rent : property.transactionType === 'SALE' ? t.sale : t.daily}
          </span>
        </div>

        {/* Top Action Buttons (Right) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(property.id);
              if (!isCompared) {
                showToast(
                  language === 'en'
                    ? 'Added to comparison'
                    : language === 'ru'
                    ? 'Добавлено к сравнению'
                    : "Taqqoslashga qo'shildi",
                  'info'
                );
              }
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isCompared
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-brand-600'
            }`}
            title={t.addToCompare}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
              if (!isFavorited) {
                showToast(
                  language === 'en'
                    ? 'Added to favorites ❤️'
                    : language === 'ru'
                    ? 'Добавлено в избранное ❤️'
                    : "Sevimlilarga qo'shildi ❤️",
                  'success'
                );
              }
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isFavorited
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600'
            }`}
            title={t.saveFavorite}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Stats (Image count) */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {property.images.length} {language === 'en' ? 'photos' : language === 'ru' ? 'фото' : 'ta rasm'}
          </div>
        )}

        {/* AI Match Badge (If available) */}
        {property.matchScore && property.matchScore >= 80 && (
          <div className="absolute bottom-2.5 left-2.5 bg-brand-500/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-brand-200 animate-pulse" />
            <span>{property.matchScore}% {language === 'en' ? 'match' : language === 'ru' ? 'совпадение' : 'mos'}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {formatPrimaryPrice()}
              {property.transactionType === 'RENT' && (
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">
                  {language === 'en' ? '/ mo' : language === 'ru' ? '/ мес' : '/ oy'}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {formatSecondaryPrice()}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {language === 'en'
              ? (property.titleEn || property.titleUz)
              : language === 'ru'
              ? (property.titleRu || property.titleUz)
              : property.titleUz}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{property.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}, {property.addressLine}</span>
          </div>

          {/* Walking Time / Travel Accessibility Metadata if present */}
          {property.travelMetadata ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-2 py-1 rounded-lg mb-2 font-bold shadow-2xs">
              <Train className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                🚶 {property.travelMetadata.durationMinutes} {language === 'en' ? 'min walk' : language === 'ru' ? 'мин пешком' : "daqiqa"} ({property.travelMetadata.routeDistanceMeters}m)
              </span>
            </div>
          ) : property.nearestMetroStation ? (
            <div className="flex items-center gap-1.5 text-xs text-brand-800 dark:text-brand-300 bg-brand-50/70 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 px-2 py-1 rounded-lg mb-2 font-semibold">
              <Train className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <span className="truncate">{property.nearestMetroStation} {language === 'en' ? 'metro' : language === 'ru' ? 'метро' : 'metrosi'} (~{Math.round((property.nearestMetroDistanceMeters || 400) / 80)} {language === 'en' ? 'min' : language === 'ru' ? 'мин' : 'daq'})</span>
            </div>
          ) : null}

          {/* AI Match Reasons Bullets */}
          {property.matchReasons && property.matchReasons.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-800 px-2 py-0.5 rounded-md mb-2 font-medium">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="truncate">{property.matchReasons[0]}</span>
            </div>
          )}
        </div>

        {/* Specs Footer */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span>{property.rooms} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>{property.areaSqm} m²</span>
            {property.floor && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>{property.floor}/{property.totalFloors || 9}-{language === 'en' ? 'fl' : language === 'ru' ? 'эт' : 'qavat'}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* WhatsApp Quick Contact */}
            {(() => {
              const propTitle = language === 'en' ? (property.titleEn || property.titleUz) : language === 'ru' ? (property.titleRu || property.titleUz) : property.titleUz;
              const waMsg = language === 'en'
                ? `Hello! I saw your listing "${propTitle}" on UyTop. Is it still available?`
                : language === 'ru'
                ? `Здравствуйте! Я увидел ваше объявление "${propTitle}" на UyTop. Оно еще актуально?`
                : `Assalomu alaykum! UyTop'da "${property.titleUz}" e'loningizni ko'rdim. Hali qolganmi?`;
              return (
                <a
                  href={`https://wa.me/${(property.ownerPhone || '+998901234567').replace(/[^\d]/g, '')}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors active:scale-90"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              );
            })()}
            {/* Call Quick Contact */}
            <a
              href={`tel:${property.ownerPhone || '+998901234567'}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors active:scale-90"
              title={language === 'en' ? 'Call' : language === 'ru' ? 'Позвонить' : "Qo'ng'iroq qilish"}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

