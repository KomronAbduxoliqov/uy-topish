'use client';

import React, { useState } from 'react';
import { RotateCcw, Check, ArrowUpDown, SlidersHorizontal, Clock, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import {
  TransactionType,
  TASHKENT_DISTRICTS
} from '@uytop/shared-types';
import { QuickFilterChips } from './QuickFilterChips';

export const FilterBar: React.FC = () => {
  const {
    language,
    filters,
    setFilters,
    resetFilters,
    setIsAdvancedFiltersOpen,
    advancedFilters,
    setIsRecentDrawerOpen
  } = useAppStore();

  const t = translations[language];
  const [showPricePopover, setShowPricePopover] = useState(false);

  const activeAdvancedCount = Object.values(advancedFilters).filter(v =>
    v !== undefined && v !== false && !(Array.isArray(v) && v.length === 0)
  ).length;

  const isAnyFilterActive =
    filters.district ||
    (filters.rooms && filters.rooms.length > 0) ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.furnished ||
    filters.nearMetro ||
    activeAdvancedCount > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 py-2.5 shadow-subtle sticky top-16 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left Side: Essential Discovery Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Transaction Type Segment Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
            {[
              { label: t.rent, value: TransactionType.RENT },
              { label: t.sale, value: TransactionType.SALE },
              { label: t.daily, value: TransactionType.DAILY },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilters({ transactionType: tab.value })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filters.transactionType === tab.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* District Dropdown */}
          <div className="relative">
            <select
              value={filters.district || ''}
              onChange={(e) => setFilters({ district: e.target.value || undefined })}
              className={`text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer border transition-colors ${
                filters.district
                  ? 'bg-brand-50 text-brand-800 border-brand-300'
                  : 'bg-slate-100 border-slate-200/60 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <option value="">{t.allDistricts}</option>
              {TASHKENT_DISTRICTS.map((d) => (
                <option key={d.id} value={d.nameUz}>
                  {language === 'en' ? (d.nameEn || d.nameUz) : language === 'ru' ? d.nameRu : d.nameUz}
                </option>
              ))}
            </select>
          </div>

          {/* Rooms Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
            <span className="text-[11px] font-bold text-slate-400 px-2">{t.roomsCount}:</span>
            {[1, 2, 3, 4].map((room) => {
              const isSelected = filters.rooms?.includes(room);
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => {
                    const currentRooms = filters.rooms || [];
                    const nextRooms = isSelected
                      ? currentRooms.filter((r) => r !== room)
                      : [...currentRooms, room];
                    setFilters({ rooms: nextRooms.length > 0 ? nextRooms : undefined });
                  }}
                  className={`w-7 h-6.5 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {room === 4 ? '4+' : room}
                </button>
              );
            })}
          </div>

          {/* Max Price Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPricePopover(!showPricePopover)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filters.maxPrice || filters.minPrice
                  ? 'bg-brand-50 border-brand-300 text-brand-700'
                  : 'bg-slate-100 border-slate-200/60 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <span>
                {filters.maxPrice
                  ? `≤ ${(Number(filters.maxPrice) / 1000000).toFixed(1)} ${language === 'en' ? 'M' : language === 'ru' ? 'млн' : 'mln'}`
                  : (language === 'en' ? 'Price' : language === 'ru' ? 'Цена' : 'Narx')}
              </span>
            </button>

            {showPricePopover && (
              <div className="absolute top-full left-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3.5 w-64 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {language === 'en' ? 'Max Price' : language === 'ru' ? 'Максимальная цена' : 'Maksimal narx'}
                  </span>
                  <button
                    onClick={() => setShowPricePopover(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[3000000, 5000000, 8000000, 15000000].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => {
                        setFilters({ maxPrice: price });
                        setShowPricePopover(false);
                      }}
                      className={`px-2 py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                        filters.maxPrice === price
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {language === 'en'
                        ? `Up to ${(price / 1000000).toFixed(0)}M`
                        : language === 'ru'
                        ? `До ${(price / 1000000).toFixed(0)} млн`
                        : `${(price / 1000000).toFixed(0)} mln gacha`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <input
                    type="number"
                    placeholder={language === 'en' ? 'Custom amount' : language === 'ru' ? 'Другая сумма' : 'Boshqa summa'}
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPricePopover(false)}
                    className="px-2.5 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Furnished Toggle */}
          <button
            type="button"
            onClick={() => setFilters({ furnished: !filters.furnished ? true : undefined })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filters.furnished
                ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {filters.furnished && <Check className="w-3.5 h-3.5 text-brand-600" />}
            <span>{t.furnished}</span>
          </button>

          {/* Near Metro Toggle */}
          <button
            type="button"
            onClick={() => setFilters({ nearMetro: !filters.nearMetro ? true : undefined })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filters.nearMetro
                ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {filters.nearMetro && <Check className="w-3.5 h-3.5 text-brand-600" />}
            <span>{t.nearMetro}</span>
          </button>
        </div>

        {/* Right Side: Sorting, Advanced Filters, History, Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-between md:justify-end">
          {/* Sort By Dropdown */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded-xl px-2.5 py-1 gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => setFilters({ sortBy: e.target.value as any })}
              className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">
                {language === 'en' ? 'Newest first' : language === 'ru' ? 'Сначала новые' : 'Eng yangi'}
              </option>
              <option value="price_asc">
                {language === 'en' ? 'Price: Low to High' : language === 'ru' ? 'Сначала дешевые' : 'Arzonroq'}
              </option>
              <option value="price_desc">
                {language === 'en' ? 'Price: High to Low' : language === 'ru' ? 'Сначала дорогие' : 'Qimmatroq'}
              </option>
              <option value="distance">
                {language === 'en' ? 'By Distance' : language === 'ru' ? 'По расстоянию' : "Masofa bo'yicha"}
              </option>
            </select>
          </div>

          {/* Advanced Filters Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsAdvancedFiltersOpen(true)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              activeAdvancedCount > 0
                ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Filters' : language === 'ru' ? 'Фильтры' : 'Kengaytirilgan'}
            </span>
            {activeAdvancedCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {activeAdvancedCount}
              </span>
            )}
          </button>

          {/* Recently Viewed History Trigger */}
          <button
            type="button"
            onClick={() => setIsRecentDrawerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={language === 'en' ? 'Recently viewed' : language === 'ru' ? 'Недавно просмотренные' : "So'nggi ko'rilganlar"}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">
              {language === 'en' ? 'Recent' : language === 'ru' ? 'История' : "Ko'rilganlar"}
            </span>
          </button>

          {/* Reset Filters (Only prominent when filters are active) */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900"
              title={t.resetFilters}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'en' ? 'Reset' : language === 'ru' ? 'Сброс' : 'Tozalash'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Preset Chips */}
      <div className="max-w-7xl mx-auto border-t border-slate-100/80 mt-2 pt-1.5">
        <QuickFilterChips />
      </div>
    </div>
  );
};
