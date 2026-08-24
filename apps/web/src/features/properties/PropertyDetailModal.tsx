'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Scale,
  MapPin,
  Train,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Send,
  ChevronLeft,
  ChevronRight,
  Share2,
  Clock,
  FileCheck
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { UZBEK_AMENITIES, VerificationTier } from '@uytop/shared-types';
import { NeighborhoodSection } from '../neighborhood/NeighborhoodSection';
import { TrustDetailSection } from '../trust/TrustDetailSection';
import { ShareModal } from '../share/ShareModal';
import { formatNumber, formatPriceUzs } from '../../lib/utils/formatters';

export const PropertyDetailModal: React.FC = () => {
  const {
    activePropertyId,
    setActivePropertyId,
    properties,
    language,
    favorites,
    toggleFavorite,
    compareList,
    toggleCompare,
    setIsMortgageModalOpen,
    setMortgageInitialPrice,
    setIsContractModalOpen,
    setContractProperty,
    addRecentlyViewed
  } = useAppStore();

  const t = translations[language];
  const property = properties.find((p) => p.id === activePropertyId);

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Track recently viewed
  useEffect(() => {
    if (activePropertyId) {
      addRecentlyViewed(activePropertyId);
    }
  }, [activePropertyId, addRecentlyViewed]);

  if (!property) return null;

  const isFavorited = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ originalUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80' }];

  const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);

  const formatPrice = (uzs: number) => formatPriceUzs(uzs);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-200">
              ID: {property.id.slice(0, 8)}
            </span>
            {property.verificationTier === VerificationTier.INSPECTED && (
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'en' ? 'Verified' : language === 'ru' ? 'Проверено' : 'Tekshirilgan'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-xl transition-all bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-600"
              title={language === 'en' ? 'Share' : language === 'ru' ? 'Поделиться' : 'Ulashish'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleCompare(property.id)}
              className={`p-2 rounded-xl transition-all ${
                isCompared
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-600'
              }`}
              title={t.compare}
            >
              <Scale className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`p-2 rounded-xl transition-all ${
                isFavorited
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
              title={t.saveFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setActivePropertyId(null)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Photo Carousel */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 group">
            <img
              src={images[currentImageIdx].originalUrl}
              alt={property.titleUz}
              className="w-full h-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {currentImageIdx + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                {language === 'en'
                  ? (property.titleEn || property.titleUz)
                  : language === 'ru'
                  ? (property.titleRu || property.titleUz)
                  : property.titleUz}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{property.city}, {property.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}, {property.addressLine}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl font-extrabold text-brand-700 tracking-tight">
                {formatPrice(property.priceUzs)}
                {property.transactionType === 'RENT' && (
                  <span className="text-sm font-semibold text-slate-500 ml-1">
                    {language === 'en' ? '/ month' : language === 'ru' ? '/ мес' : '/ oy'}
                  </span>
                )}
              </div>
              {property.priceUsd > 0 && (
                <div className="text-sm font-semibold text-slate-400">
                  ≈ ${formatNumber(property.priceUsd)} • {formatNumber(Math.round(property.priceUzs / property.areaSqm))} so'm/m²
                </div>
              )}
              {property.transactionType === 'SALE' && (
                <button
                  type="button"
                  onClick={() => {
                    setMortgageInitialPrice(Number(property.priceUzs));
                    setIsMortgageModalOpen(true);
                  }}
                  className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>🏦 {language === 'en' ? 'Calculate Mortgage' : language === 'ru' ? 'Ипотечный калькулятор' : 'Ipoteka hisoblash'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Specifications Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {language === 'en' ? 'Rooms' : language === 'ru' ? 'Комнаты' : 'Xonalar'}
              </span>
              <span className="text-base font-bold text-slate-800">
                {property.rooms} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {language === 'en' ? 'Total Area' : language === 'ru' ? 'Общая площадь' : 'Umumiy maydon'}
              </span>
              <span className="text-base font-bold text-slate-800">{property.areaSqm} m²</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {language === 'en' ? 'Floor' : language === 'ru' ? 'Этаж' : 'Qavat'}
              </span>
              <span className="text-base font-bold text-slate-800">
                {property.floor || 1} / {property.totalFloors || 9}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {language === 'en' ? 'Renovation' : language === 'ru' ? 'Ремонт' : "Ta'mir holati"}
              </span>
              <span className="text-base font-bold text-slate-800">
                {property.renovation === 'NEW'
                  ? (language === 'en' ? 'Fresh / Euro' : language === 'ru' ? 'Новый / Евро' : 'Yangi / Evro')
                  : (language === 'en' ? 'Renovated' : language === 'ru' ? 'С ремонтом' : "Ta'mirlangan")}
              </span>
            </div>
          </div>

          {/* Nearest Metro Station */}
          {property.nearestMetroStation && (
            <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-900">
                    {property.nearestMetroStation} {language === 'en' ? 'Metro' : language === 'ru' ? 'метро' : 'metrosi'}
                  </h4>
                  <p className="text-xs text-brand-700 font-medium">
                    {language === 'en' ? 'Walking distance: ' : language === 'ru' ? 'Пешком: ' : 'Piyoda masofa: '}
                    {property.nearestMetroDistanceMeters || 400} {language === 'en' ? 'meters' : language === 'ru' ? 'метров' : 'metr'} (~
                    {Math.max(1, Math.round((property.nearestMetroDistanceMeters || 400) / 80))} {t.walkingMinutes})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {language === 'en' ? 'Description' : language === 'ru' ? 'Описание' : 'Tavsif'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {language === 'en'
                ? (property.descriptionEn || property.descriptionUz)
                : language === 'ru'
                ? (property.descriptionRu || property.descriptionUz)
                : property.descriptionUz}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {language === 'en' ? 'Amenities & Features' : language === 'ru' ? 'Удобства' : 'Mavjud qulayliklar'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {UZBEK_AMENITIES.map((amenity) => {
                const hasAmenity = property.amenities && property.amenities[amenity.key];
                return (
                  <div
                    key={amenity.key}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
                      hasAmenity
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${hasAmenity ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>
                      {language === 'en'
                        ? (amenity.nameEn || amenity.nameUz)
                        : language === 'ru'
                        ? amenity.nameRu
                        : amenity.nameUz}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Trust & Fraud Protection Details */}
          <TrustDetailSection
            propertyId={property.id}
            verificationTier={property.verificationTier}
            ownerPhone={property.ownerPhone}
          />

          {/* Neighborhood & POI Explorer */}
          <NeighborhoodSection
            district={property.district}
            lat={property.latitude}
            lng={property.longitude}
          />

          {/* Legal Rental Contract Quick Generator CTA */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-950 dark:text-purple-200">
                  {language === 'en' ? 'Generate Rental Contract' : language === 'ru' ? 'Сформировать договор аренды' : 'Rasmiy Ijara Shartnomasini Tuzish'}
                </h4>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {language === 'en'
                    ? 'Official template for ijara.soliq.uz + Handover act'
                    : language === 'ru'
                    ? 'Для ijara.soliq.uz и Акт приема-передачи с описью'
                    : 'ijara.soliq.uz talablariga mos + Topshirish dalolatnomasi'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setContractProperty(property);
                setIsContractModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <span>{language === 'en' ? 'Create Contract' : language === 'ru' ? 'Создать договор' : 'Shartnoma tuzish'}</span>
            </button>
          </div>

          {/* Contact Owner Section */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                {language === 'en' ? 'Listing Owner' : language === 'ru' ? 'Владелец объявления' : "E'lon egasi"}
              </span>
              <h4 className="text-lg font-bold">
                {property.ownerName || (language === 'en' ? 'Property Owner' : language === 'ru' ? 'Владелец недвижимости' : 'Mulk Egasi')}
              </h4>
              <p className="text-xs text-brand-400 font-medium">
                {language === 'en' ? 'Phone number verified' : language === 'ru' ? 'Номер телефона подтвержден' : 'Telefon raqami tekshirilgan'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`tel:${property.ownerPhone || '+998901234567'}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>{property.ownerPhone || "+998 90 123-45-67"}</span>
              </a>
              {(() => {
                const propTitle = language === 'en' ? (property.titleEn || property.titleUz) : language === 'ru' ? (property.titleRu || property.titleUz) : property.titleUz;
                const waText = language === 'en'
                  ? `Hello! I saw your listing "${propTitle}" on UyTop. Is it still available?`
                  : language === 'ru'
                  ? `Здравствуйте! Я увидел ваше объявление "${propTitle}" на UyTop. Оно еще актуально?`
                  : `Assalomu alaykum! UyTop'da "${property.titleUz}" e'loningizni ko'rdim. Hali aktualmi?`;
                return (
                  <a
                    href={`https://wa.me/${(property.ownerPhone || '+998901234567').replace(/[^\d]/g, '')}?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all shadow-md"
                    title="WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                );
              })()}
              <a
                href={`https://t.me/${(property.ownerPhone || '998901234567').replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all shadow-md"
                title={t.writeTelegram}
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        property={{
          id: property.id,
          titleUz: property.titleUz,
          titleRu: property.titleRu,
          titleEn: property.titleEn,
          district: property.district,
          rooms: property.rooms,
          priceUzs: property.priceUzs,
          imageUrl: images[0]?.originalUrl
        }}
      />
    </div>
  );
};
