import React, { useState } from 'react';
import {
  X,
  Heart,
  Scale,
  Share2,
  MapPin,
  Train,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Send,
  Building,
  Maximize2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { UZBEK_AMENITIES, VerificationTier } from '@uytop/shared-types';

export const PropertyDetailModal: React.FC = () => {
  const {
    activePropertyId,
    setActivePropertyId,
    properties,
    language,
    favorites,
    toggleFavorite,
    compareList,
    toggleCompare
  } = useAppStore();

  const t = translations[language];
  const property = properties.find((p) => p.id === activePropertyId);

  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  if (!property) return null;

  const isFavorited = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ originalUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80' }];

  const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);

  const formatPrice = (uzs: number) => uzs.toLocaleString('uz-UZ') + " so'm";

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
                <span>Tekshirilgan</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
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
                {language === 'uz' ? property.titleUz : (property.titleRu || property.titleUz)}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{property.city}, {property.district} tumani, {property.addressLine}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl font-extrabold text-brand-700 tracking-tight">
                {formatPrice(property.priceUzs)}
                {property.transactionType === 'RENT' && (
                  <span className="text-sm font-semibold text-slate-500 ml-1">/ oy</span>
                )}
              </div>
              {property.priceUsd > 0 && (
                <div className="text-sm font-semibold text-slate-400">
                  ≈ ${property.priceUsd.toLocaleString()} • {Math.round(property.priceUzs / property.areaSqm).toLocaleString()} so'm/m²
                </div>
              )}
            </div>
          </div>

          {/* Quick Specifications Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Xonalar</span>
              <span className="text-base font-bold text-slate-800">{property.rooms} xona</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Umumiy maydon</span>
              <span className="text-base font-bold text-slate-800">{property.areaSqm} m²</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Qavat</span>
              <span className="text-base font-bold text-slate-800">
                {property.floor || 1} / {property.totalFloors || 9}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Ta'mir holati</span>
              <span className="text-base font-bold text-slate-800">
                {property.renovation === 'NEW' ? 'Yangi / Evro' : 'Ta\'mirlangan'}
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
                    {property.nearestMetroStation} metrosi
                  </h4>
                  <p className="text-xs text-brand-700 font-medium">
                    Piyoda masofa: {property.nearestMetroDistanceMeters || 400} metr (taxminan{' '}
                    {Math.max(1, Math.round((property.nearestMetroDistanceMeters || 400) / 80))} {t.walkingMinutes})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Tavsif</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {language === 'uz' ? property.descriptionUz : (property.descriptionRu || property.descriptionUz)}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Mavjud qulayliklar</h3>
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
                    <span>{language === 'uz' ? amenity.nameUz : amenity.nameRu}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Owner Section */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-0.5">E'lon egasi</span>
              <h4 className="text-lg font-bold">{property.ownerName || "Mulk Egasi"}</h4>
              <p className="text-xs text-brand-400 font-medium">Telefon raqami tekshirilgan</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`tel:${property.ownerPhone || '+998901234567'}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>{property.ownerPhone || "+998 90 123-45-67"}</span>
              </a>
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
    </div>
  );
};
