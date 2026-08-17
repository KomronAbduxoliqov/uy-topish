import React from 'react';
import {
  Heart,
  Scale,
  MapPin,
  Train,
  CheckCircle2,
  ShieldCheck,
  Eye,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { Property, VerificationTier } from '@uytop/shared-types';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';

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
    setActivePropertyId
  } = useAppStore();

  const t = translations[language];
  const isFavorited = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);
  const isActive = activePropertyId === property.id;

  const coverImage = property.images && property.images.length > 0
    ? property.images[0].originalUrl
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  const formatPrice = (uzs: number) => {
    return uzs.toLocaleString('uz-UZ') + " so'm";
  };

  const renderVerificationBadge = () => {
    if (property.verificationTier === VerificationTier.INSPECTED) {
      return (
        <span className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          <ShieldCheck className="w-3 h-3" />
          <span>Ko'rikdan o'tgan</span>
        </span>
      );
    }
    if (property.verificationTier === VerificationTier.DOCS_VERIFIED) {
      return (
        <span className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          <CheckCircle2 className="w-3 h-3" />
          <span>Hujjati tekshirilgan</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => setActivePropertyId(property.id)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isActive
          ? 'ring-2 ring-brand-500 border-brand-500 shadow-premium'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-card'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={property.titleUz}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {renderVerificationBadge()}
          <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {property.transactionType === 'RENT' ? t.rent : property.transactionType === 'SALE' ? t.sale : t.daily}
          </span>
        </div>

        {/* Top Right Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(property.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur transition-all ${
              isCompared
                ? 'bg-brand-600 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-brand-600'
            }`}
            title={t.addToCompare}
          >
            <Scale className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur transition-all ${
              isFavorited
                ? 'bg-rose-600 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-600'
            }`}
            title={t.saveFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Stats (Photos count) */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            {property.images.length} rasm
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              {formatPrice(property.priceUzs)}
              {property.transactionType === 'RENT' && (
                <span className="text-xs font-semibold text-slate-500 ml-1">/ oy</span>
              )}
            </span>
            {property.priceUsd > 0 && (
              <span className="text-xs font-semibold text-slate-400">
                ${property.priceUsd.toLocaleString()}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1 group-hover:text-brand-600 transition-colors">
            {language === 'uz' ? property.titleUz : (property.titleRu || property.titleUz)}
          </h3>

          {/* Address & District */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{property.district}, {property.addressLine}</span>
          </div>

          {/* Nearest Metro Proximity */}
          {property.nearestMetroStation && (
            <div className="flex items-center gap-1.5 text-xs text-brand-700 bg-brand-50/80 px-2 py-1 rounded-lg mb-2.5 font-medium">
              <Train className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span className="truncate">
                {property.nearestMetroStation} metrosi •{' '}
                {Math.max(1, Math.round((property.nearestMetroDistanceMeters || 400) / 80))} {t.walkingMinutes}
              </span>
            </div>
          )}

          {/* AI Match Reason (If available) */}
          {property.matchReasons && property.matchReasons.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md mb-2">
              <Sparkles className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="truncate font-medium">{property.matchReasons[0]}</span>
            </div>
          )}
        </div>

        {/* Specs Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-3">
            <span>{property.rooms} xona</span>
            <span>•</span>
            <span>{property.areaSqm} m²</span>
            {property.floor && (
              <>
                <span>•</span>
                <span>{property.floor}/{property.totalFloors || 9}-qavat</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-normal">
            {property.furnished ? 'Mebelli' : 'Mebelsiz'}
          </div>
        </div>
      </div>
    </div>
  );
};
