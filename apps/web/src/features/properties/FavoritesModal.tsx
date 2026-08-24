'use client';

import React from 'react';
import {
  X,
  Heart,
  Scale,
  MapPin,
  Trash2,
  Phone,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Property } from '@uytop/shared-types';
import { formatNumber, formatPriceUzs } from '../../lib/utils/formatters';

export const FavoritesModal: React.FC = () => {
  const {
    isFavoritesModalOpen,
    setIsFavoritesModalOpen,
    favorites,
    toggleFavorite,
    properties,
    setActivePropertyId,
    compareList,
    toggleCompare,
    setIsCompareModalOpen,
    language
  } = useAppStore();

  if (!isFavoritesModalOpen) return null;

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

  const totalMonthlyRent = favoriteProperties
    .filter((p) => p.transactionType === 'RENT')
    .reduce((sum, p) => sum + Number(p.priceUzs), 0);

  const totalSalePrice = favoriteProperties
    .filter((p) => p.transactionType === 'SALE')
    .reduce((sum, p) => sum + Number(p.priceUzs), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900 shadow-sm">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                {language === 'en' ? 'Saved Properties' : language === 'ru' ? 'Избранные объявления' : "Saqlangan e'lonlar"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {favoriteProperties.length} {language === 'en' ? 'saved properties' : language === 'ru' ? 'сохранено' : "ta e'lon saqlangan"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFavoritesModalOpen(false)}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analytics Bar if there are favorites */}
        {favoriteProperties.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              {totalMonthlyRent > 0 && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Total monthly rent:' : language === 'ru' ? 'Общая аренда:' : 'Oylik ijara jami:'}{' '}
                  </span>
                  <b className="text-slate-900 dark:text-white font-bold">
                    {formatPriceUzs(totalMonthlyRent)}{language === 'en' ? '/mo' : language === 'ru' ? '/мес' : '/oy'}
                  </b>
                </div>
              )}
              {totalSalePrice > 0 && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Total sale value:' : language === 'ru' ? 'Общая стоимость продажи:' : 'Sotuv qiymati jami:'}{' '}
                  </span>
                  <b className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {formatPriceUzs(totalSalePrice)}
                  </b>
                </div>
              )}
            </div>

            {favoriteProperties.length >= 2 && (
              <button
                onClick={() => {
                  setIsFavoritesModalOpen(false);
                  setIsCompareModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 font-bold rounded-lg border border-brand-200 dark:border-brand-800 transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>
                  {language === 'en' ? 'Compare All' : language === 'ru' ? 'Сравнить все' : 'Barchasini solishtirish'} ({favoriteProperties.length})
                </span>
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1 bg-white dark:bg-slate-900">
          {favoriteProperties.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
                {language === 'en' ? 'No saved properties' : language === 'ru' ? 'Нет сохраненных объявлений' : "Saqlangan e'lonlar mavjud emas"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                {language === 'en'
                  ? 'Click the heart icon on any listing to save it here for quick access.'
                  : language === 'ru'
                  ? 'Нажмите на иконку сердечка на любом объявлении, чтобы сохранить его здесь.'
                  : "Sizga yoqqan mulklarning ustidagi yurakcha tugmasini bosib, ularni bu yerda to'plashingiz mumkin."}
              </p>
              <button
                onClick={() => setIsFavoritesModalOpen(false)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                {language === 'en' ? 'Browse Listings' : language === 'ru' ? 'Смотреть объявления' : "E'lonlarni ko'rish"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteProperties.map((property) => {
                const isCompared = compareList.includes(property.id);
                const coverImage =
                  property.images && property.images.length > 0
                    ? property.images[0].thumbnailUrl || property.images[0].originalUrl
                    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

                const title =
                  language === 'en'
                    ? (property.titleEn || property.titleUz)
                    : language === 'ru'
                    ? (property.titleRu || property.titleUz)
                    : property.titleUz;

                return (
                  <div
                    key={property.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                        <img
                          src={coverImage}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {property.transactionType === 'RENT'
                            ? (language === 'en' ? 'Rent' : language === 'ru' ? 'Аренда' : 'Ijara')
                            : (language === 'en' ? 'Sale' : language === 'ru' ? 'Продажа' : 'Sotuv')}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-extrabold text-brand-700 dark:text-brand-400">
                          {formatPriceUzs(property.priceUzs)}
                          {property.transactionType === 'RENT' && (
                            <span className="text-[10px] font-normal text-slate-400">
                              {' '}{language === 'en' ? '/mo' : language === 'ru' ? '/мес' : '/oy'}
                            </span>
                          )}
                        </div>

                        <h4
                          onClick={() => {
                            setActivePropertyId(property.id);
                            setIsFavoritesModalOpen(false);
                          }}
                          className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer mt-0.5"
                        >
                          {title}
                        </h4>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">
                            {property.district}, {property.addressLine}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1">
                          {property.rooms} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'} • {property.areaSqm} m² • {property.furnished ? (language === 'en' ? 'Furnished' : language === 'ru' ? 'С мебелью' : 'Mebelli') : (language === 'en' ? 'Unfurnished' : language === 'ru' ? 'Без мебели' : 'Mebelsiz')}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCompare(property.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                            isCompared
                              ? 'bg-brand-600 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <Scale className="w-3 h-3" />
                          <span>
                            {isCompared
                              ? (language === 'en' ? 'Added' : language === 'ru' ? 'Добавлено' : "Qo'shilgan")
                              : (language === 'en' ? 'Compare' : language === 'ru' ? 'Сравнить' : 'Solishtirish')}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(property.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title={language === 'en' ? 'Remove from saved' : language === 'ru' ? 'Удалить из избранного' : "Saqlanganlardan o'chirish"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActivePropertyId(property.id);
                          setIsFavoritesModalOpen(false);
                        }}
                        className="flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 text-xs"
                      >
                        <span>{language === 'en' ? 'Details' : language === 'ru' ? 'Подробнее' : 'Batafsil'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {language === 'en'
              ? 'Saved properties are stored in your browser.'
              : language === 'ru'
              ? 'Избранные объявления сохраняются в памяти браузера.'
              : 'Saqlanganlar brauzeringiz xotirasida saqlanadi.'}
          </span>
          <button
            onClick={() => setIsFavoritesModalOpen(false)}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm ml-auto"
          >
            {language === 'en' ? 'Close' : language === 'ru' ? 'Закрыть' : 'Yopish'}
          </button>
        </div>
      </div>
    </div>
  );
};
