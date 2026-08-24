'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AiSearchHero } from '../../features/search/AiSearchHero';
import { FilterBar } from '../../features/search/FilterBar';
import { PropertyGrid } from '../../features/properties/PropertyGrid';
import { YandexMap } from '../../features/map/YandexMap';
import { useAppStore } from '../../store/useAppStore';
import { apiClient } from '../../lib/api/client';
import { Map, List } from 'lucide-react';
import { Language } from '../../i18n';

// Dynamic import with ssr: false guarantees zero SSR hydration mismatches
const MarketStatsSection = dynamic(
  () => import('../../features/stats/MarketStatsSection').then((mod) => mod.MarketStatsSection),
  { ssr: false }
);

export default function LocaleHomePage({ params: { locale } }: { params: { locale: string } }) {
  const {
    filters,
    setProperties,
    setIsLoadingProperties,
    isMobileMapView,
    setIsMobileMapView,
    setLanguage,
    language
  } = useAppStore();

  useEffect(() => {
    if (locale === 'ru' || locale === 'uz' || locale === 'en') {
      setLanguage(locale as Language);
    }
  }, [locale, setLanguage]);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    async function loadData() {
      setIsLoadingProperties(true);
      try {
        const res = await apiClient.searchProperties(filters);
        if (isMounted) {
          setProperties(res.items);
          retryCount = 0;
        }
      } catch (err) {
        console.error(err);
        if (isMounted && retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(loadData, 1500);
          return;
        }
      } finally {
        if (isMounted) {
          setIsLoadingProperties(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [filters, setIsLoadingProperties, setProperties]);

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      {/* Hero AI Search Section */}
      <AiSearchHero />

      {/* Faceted Filter Bar */}
      <FilterBar />

      {/* Main Responsive Split Content Area */}
      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Side: Property Cards Grid */}
        <div
          className={`lg:w-[50%] xl:w-[48%] overflow-y-auto lg:h-[calc(100vh-230px)] lg:border-r border-slate-200 dark:border-slate-800 ${
            isMobileMapView ? 'hidden lg:block' : 'block'
          }`}
        >
          <PropertyGrid />
        </div>

        {/* Right Side: Interactive Yandex Map */}
        <div
          className={`lg:w-[50%] xl:w-[52%] sticky top-0 lg:h-[calc(100vh-230px)] overflow-hidden ${
            isMobileMapView ? 'block h-[calc(100vh-230px)]' : 'hidden lg:block'
          }`}
        >
          <YandexMap />
        </div>
      </div>

      {/* Market Statistics Section */}
      <MarketStatsSection />

      {/* Floating Mobile Map / List Toggle Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
        <button
          onClick={() => setIsMobileMapView(!isMobileMapView)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-brand-600 text-white font-bold text-sm rounded-full shadow-floating border border-slate-700 dark:border-brand-500 active:scale-95 transition-all"
        >
          {isMobileMapView ? (
            <>
              <List className="w-4 h-4 text-brand-400 dark:text-white" />
              <span>
                {language === 'en' ? 'Show List' : language === 'ru' ? 'Показать список' : "Ro'yxatni ko'rish"}
              </span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4 text-brand-400 dark:text-white" />
              <span>
                {language === 'en' ? 'Show Map' : language === 'ru' ? 'Показать на карте' : "Xaritada ko'rish"}
              </span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
