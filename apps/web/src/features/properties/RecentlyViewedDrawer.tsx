'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Clock, MapPin } from 'lucide-react';
import { formatPriceUzs } from '../../lib/utils/formatters';

export function RecentlyViewedDrawer() {
  const {
    isRecentDrawerOpen,
    setIsRecentDrawerOpen,
    recentlyViewed,
    clearRecentlyViewed,
    properties,
    setActivePropertyId,
    language
  } = useAppStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Hydrate recently viewed from localStorage on mount
    if (typeof window !== 'undefined' && recentlyViewed.length === 0) {
      const stored = localStorage.getItem('uytop_recent');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            useAppStore.setState({ recentlyViewed: parsed });
          }
        } catch (e) {
          console.error('Failed to parse recent properties', e);
        }
      }
    }
  }, [recentlyViewed.length]);

  if (!mounted) return null;

  // Match IDs to loaded properties
  const recentProperties = recentlyViewed
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const formatPrice = (uzs: number) => formatPriceUzs(uzs);

  return (
    <>
      {/* Backdrop */}
      {isRecentDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 animate-fadeIn transition-all"
          onClick={() => setIsRecentDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-l-3xl flex flex-col ${
          isRecentDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Recently Viewed' : language === 'ru' ? 'Недавно просмотренные' : "Yaqinda ko'rilganlar"}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {recentProperties.length} {language === 'en' ? 'listings' : language === 'ru' ? 'объявлений' : "ta e'lon"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRecentDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {recentProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-500 py-16">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium">
                {language === 'en' ? 'No recently viewed listings' : language === 'ru' ? 'Вы еще не просматривали объявления' : "Siz hali hech qanday e'lonni ko'rmagansiz"}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'en' ? 'Properties you open will appear here' : language === 'ru' ? 'Открытые вами объявления появятся здесь' : "E'lonlarni ochganingizda bu yerda ko'rinadi"}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentProperties.map((property) => {
                const coverImage = property.images && property.images.length > 0
                  ? property.images[0].originalUrl
                  : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=60';

                const title =
                  language === 'en'
                    ? (property.titleEn || property.titleUz)
                    : language === 'ru'
                    ? (property.titleRu || property.titleUz)
                    : property.titleUz;

                return (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group"
                    onClick={() => {
                      setIsRecentDrawerOpen(false);
                      setActivePropertyId(property.id);
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700">
                      <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        {property.district}
                      </p>
                      <p className="text-brand-700 dark:text-brand-400 font-extrabold text-xs mt-0.5">
                        {formatPrice(property.priceUzs)}
                      </p>
                    </div>

                    {/* View button */}
                    <button className="shrink-0 text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors">
                      {language === 'en' ? 'View' : language === 'ru' ? 'Открыть' : "Ko'rish"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {recentProperties.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 rounded-bl-3xl">
            <button
              onClick={clearRecentlyViewed}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-3.5 h-3.5" />
              {language === 'en' ? 'Clear History' : language === 'ru' ? 'Очистить историю' : 'Tarixni tozalash'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
