import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiClient } from '../../../../lib/api/client';
import {
  MapPin,
  Train,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Send,
  ArrowLeft
} from 'lucide-react';
import { UZBEK_AMENITIES, VerificationTier } from '@uytop/shared-types';
import { formatNumber, formatPriceUzs } from '../../../../lib/utils/formatters';

interface PropertyPageProps {
  params: {
    locale: string;
    id: string;
  };
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const property = await apiClient.getPropertyById(params.id);
  if (!property) {
    return {
      title:
        params.locale === 'en'
          ? 'Listing not found | UyTop'
          : params.locale === 'ru'
          ? 'Объявление не найдено | UyTop'
          : "E'lon topilmadi | UyTop",
    };
  }

  const title =
    params.locale === 'en'
      ? (property.titleEn || property.titleUz)
      : params.locale === 'ru'
      ? (property.titleRu || property.titleUz)
      : property.titleUz;

  const description =
    params.locale === 'en'
      ? (property.descriptionEn || property.descriptionUz)
      : params.locale === 'ru'
      ? (property.descriptionRu || property.descriptionUz)
      : property.descriptionUz;

  const imageUrl = property.images?.[0]?.originalUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2';

  return {
    title: `${title} — ${formatPriceUzs(property.priceUzs)}`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | UyTop`,
      description: description.slice(0, 160),
      images: [{ url: imageUrl }],
      type: 'article',
      locale: params.locale === 'en' ? 'en_US' : params.locale === 'ru' ? 'ru_RU' : 'uz_UZ',
    },
    alternates: {
      canonical: `/${params.locale}/properties/${params.id}`,
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const property = await apiClient.getPropertyById(params.id);
  if (!property) {
    notFound();
  }

  const title =
    params.locale === 'en'
      ? (property.titleEn || property.titleUz)
      : params.locale === 'ru'
      ? (property.titleRu || property.titleUz)
      : property.titleUz;

  const description =
    params.locale === 'en'
      ? (property.descriptionEn || property.descriptionUz)
      : params.locale === 'ru'
      ? (property.descriptionRu || property.descriptionUz)
      : property.descriptionUz;

  // Schema.org RealEstateListing JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description: description,
    price: property.priceUzs,
    priceCurrency: 'UZS',
    image: property.images?.map((img) => img.originalUrl) || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.district,
      streetAddress: property.addressLine,
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back to search link */}
      <Link
        href={`/${params.locale}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>
          {params.locale === 'en'
            ? 'Back to Search & Map'
            : params.locale === 'ru'
            ? 'Вернуться к поиску'
            : 'Xaritaga qaytish'}
        </span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        {/* Main Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-slate-900">
          {property.images && property.images.length > 0 ? (
            property.images.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <img
                  src={img.originalUrl}
                  alt={`${title} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {property.verificationTier === VerificationTier.INSPECTED && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {params.locale === 'en'
                        ? 'Verified Listing'
                        : params.locale === 'ru'
                        ? 'Проверенное объявление'
                        : "Tekshirilgan e'lon"}
                    </span>
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {property.transactionType === 'RENT'
                    ? (params.locale === 'en' ? 'Rent' : params.locale === 'ru' ? 'Аренда' : 'Ijara')
                    : (params.locale === 'en' ? 'Sale' : params.locale === 'ru' ? 'Продажа' : 'Sotuv')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>
                  {property.city}, {property.district} {params.locale === 'en' ? 'district' : params.locale === 'ru' ? 'район' : 'tumani'}, {property.addressLine}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl font-extrabold text-brand-700 tracking-tight">
                {formatPriceUzs(property.priceUzs)}
                {property.transactionType === 'RENT' && (
                  <span className="text-sm font-semibold text-slate-500 ml-1">
                    {params.locale === 'en' ? '/ month' : params.locale === 'ru' ? '/ мес' : '/ oy'}
                  </span>
                )}
              </div>
              {property.priceUsd > 0 && (
                <div className="text-sm font-semibold text-slate-400">
                  ≈ ${formatNumber(property.priceUsd)}
                </div>
              )}
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {params.locale === 'en' ? 'Rooms' : params.locale === 'ru' ? 'Комнаты' : 'Xonalar'}
              </span>
              <span className="text-base font-bold text-slate-800">
                {property.rooms} {params.locale === 'en' ? 'rooms' : params.locale === 'ru' ? 'комн.' : 'xona'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {params.locale === 'en' ? 'Total Area' : params.locale === 'ru' ? 'Общая площадь' : 'Maydon'}
              </span>
              <span className="text-base font-bold text-slate-800">{property.areaSqm} m²</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {params.locale === 'en' ? 'Floor' : params.locale === 'ru' ? 'Этаж' : 'Qavat'}
              </span>
              <span className="text-base font-bold text-slate-800">
                {property.floor || 1} / {property.totalFloors || 9}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {params.locale === 'en' ? 'Renovation' : params.locale === 'ru' ? 'Ремонт' : "Ta'mir"}
              </span>
              <span className="text-base font-bold text-slate-800">
                {property.renovation === 'NEW'
                  ? (params.locale === 'en' ? 'Fresh / Euro' : params.locale === 'ru' ? 'Новый / Евро' : 'Yangi / Evro')
                  : (params.locale === 'en' ? 'Renovated' : params.locale === 'ru' ? 'С ремонтом' : "Ta'mirlangan")}
              </span>
            </div>
          </div>

          {/* Metro Proximity */}
          {property.nearestMetroStation && (
            <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-900">
                    {property.nearestMetroStation} {params.locale === 'en' ? 'Metro' : params.locale === 'ru' ? 'метро' : 'metrosi'}
                  </h4>
                  <p className="text-xs text-brand-700 font-medium">
                    {params.locale === 'en' ? 'Walking distance: ' : params.locale === 'ru' ? 'Пешком: ' : 'Piyoda masofa: '}
                    {property.nearestMetroDistanceMeters || 400} {params.locale === 'en' ? 'meters' : params.locale === 'ru' ? 'метров' : 'metr'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {params.locale === 'en' ? 'Description' : params.locale === 'ru' ? 'Описание' : 'Tavsif'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {params.locale === 'en' ? 'Amenities & Features' : params.locale === 'ru' ? 'Удобства' : 'Mavjud qulayliklar'}
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
                      {params.locale === 'en'
                        ? (amenity.nameEn || amenity.nameUz)
                        : params.locale === 'ru'
                        ? amenity.nameRu
                        : amenity.nameUz}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Owner / Agent Card */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                {params.locale === 'en' ? 'Listing Owner' : params.locale === 'ru' ? 'Владелец объявления' : "E'lon egasi"}
              </span>
              <h4 className="text-lg font-bold">
                {property.ownerName || (params.locale === 'en' ? 'Property Owner' : params.locale === 'ru' ? 'Владелец недвижимости' : 'Mulk Egasi')}
              </h4>
              <p className="text-xs text-brand-400 font-medium">
                {params.locale === 'en' ? 'Phone number verified' : params.locale === 'ru' ? 'Номер телефона подтвержден' : 'Telefon raqami tekshirilgan'}
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
              <a
                href={`https://t.me/${(property.ownerPhone || '998901234567').replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all shadow-md"
                title={params.locale === 'en' ? 'Contact via Telegram' : params.locale === 'ru' ? 'Написать в Telegram' : "Telegram orqali bog'lanish"}
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
