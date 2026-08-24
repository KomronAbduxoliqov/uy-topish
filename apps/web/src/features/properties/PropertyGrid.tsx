'use client';

import React from 'react';
import { PropertyCard } from './PropertyCard';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { SearchX, RotateCcw, Loader2 } from 'lucide-react';

export const PropertyGrid: React.FC = () => {
  const {
    properties,
    isLoadingProperties,
    language,
    filters,
    setFilters,
    resetFilters,
    selectedRadiusMeters
  } = useAppStore();

  const t = translations[language];

  // ALWAYS call hooks at top level before ANY conditional return
  const { visibleCount, hasMore, sentinelRef } = useInfiniteScroll({
    totalItems: properties.length,
    batchSize: 12,
    rootMargin: '600px'
  });

  const visibleProperties = properties.slice(0, visibleCount);

  if (isLoadingProperties) {
    return (
      <div className="p-3 sm:p-4 space-y-4 animate-fadeIn">
        <div className="h-5 skeleton-shimmer rounded-md w-44" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3 shadow-2xs"
            >
              <div className="aspect-[16/10] skeleton-shimmer rounded-xl" />
              <div className="h-5 skeleton-shimmer rounded-md w-2/5" />
              <div className="h-4 skeleton-shimmer rounded-md w-4/5" />
              <div className="h-3 skeleton-shimmer rounded-md w-3/5" />
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div className="h-3 skeleton-shimmer rounded w-1/3" />
                <div className="h-3 skeleton-shimmer rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center my-auto animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1.5">
          {t.noListingsFound}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 font-medium">
          {language === 'en'
            ? 'No listings found matching your current filters. We recommend widening your search parameters:'
            : language === 'ru'
            ? 'По заданным фильтрам объявлений не найдено. Рекомендуем расширить параметры поиска:'
            : "Kiritilgan filtrlar bo'yicha hozircha e'lon topilmadi. Qidiruv parametrlarini kengaytirishni tavsiya qilamiz:"}
        </p>

        {/* Actionable Recovery Suggestions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center mb-5">
          {filters.district && (
            <button
              type="button"
              onClick={() => setFilters({ district: undefined })}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              {language === 'en' ? 'Search all districts' : language === 'ru' ? 'Искать по всем районам' : "Barcha tumanlar bo'yicha qidirish"}
            </button>
          )}

          {filters.maxPrice && (
            <button
              type="button"
              onClick={() => setFilters({ maxPrice: Number(filters.maxPrice) + 1500000 })}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              {language === 'en' ? 'Increase budget by +1.5M UZS' : language === 'ru' ? 'Увеличить бюджет на +1.5 млн' : 'Budjetni +1.5 mln ga oshirish'}
            </button>
          )}

          {filters.furnished && (
            <button
              type="button"
              onClick={() => setFilters({ furnished: undefined })}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              {language === 'en' ? 'Include unfurnished homes' : language === 'ru' ? 'Показать без мебели' : "Mebelsiz uylarni ham ko'rish"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetFilters}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 animate-fadeIn">
      {/* Header result summary context */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
            {filters.district
              ? `${filters.district} ${language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'} • `
              : ''}
            {properties.length} {t.foundListings}
          </span>
          {selectedRadiusMeters && (
            <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
              {selectedRadiusMeters / 1000} km {language === 'en' ? 'radius' : language === 'ru' ? 'радиус' : 'radius'}
            </span>
          )}
        </div>

        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
          {language === 'en' ? 'Ranked by AI Match' : language === 'ru' ? 'AI сортировка' : 'AI saralash asosida'}
        </span>
      </div>

      {/* Property Cards Grid with Infinite Scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {visibleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Infinite Scroll Sentinel & Loading Indicator */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'en' ? 'Loading more...' : language === 'ru' ? 'Загрузка...' : "Ko'proq yuklanmoqda..."}</span>
          </div>
        </div>
      )}
    </div>
  );
};
