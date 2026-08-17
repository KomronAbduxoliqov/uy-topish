import React from 'react';
import {
  Building,
  RotateCcw,
  SlidersHorizontal,
  Home,
  Check
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import {
  TransactionType,
  PropertyType,
  TASHKENT_DISTRICTS
} from '@uytop/shared-types';

export const FilterBar: React.FC = () => {
  const {
    language,
    filters,
    setFilters,
    resetFilters,
    properties
  } = useAppStore();

  const t = translations[language];

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shadow-subtle">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Transaction & Property Type Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Transaction Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {[
              { label: t.rent, value: TransactionType.RENT },
              { label: t.sale, value: TransactionType.SALE },
              { label: t.daily, value: TransactionType.DAILY },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilters({ transactionType: tab.value })}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filters.transactionType === tab.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* District Dropdown */}
          <select
            value={filters.district || ''}
            onChange={(e) => setFilters({ district: e.target.value || undefined })}
            className="bg-slate-100 border-none text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
          >
            <option value="">{t.allDistricts}</option>
            {TASHKENT_DISTRICTS.map((d) => (
              <option key={d.id} value={d.nameUz}>
                {language === 'uz' ? d.nameUz : d.nameRu}
              </option>
            ))}
          </select>

          {/* Rooms Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 px-2">{t.roomsCount}:</span>
            {[1, 2, 3, 4].map((room) => {
              const isSelected = filters.rooms?.includes(room);
              return (
                <button
                  key={room}
                  onClick={() => {
                    const currentRooms = filters.rooms || [];
                    const nextRooms = isSelected
                      ? currentRooms.filter((r) => r !== room)
                      : [...currentRooms, room];
                    setFilters({ rooms: nextRooms.length > 0 ? nextRooms : undefined });
                  }}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
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
        </div>

        {/* Right: Quick Checkbox Chips & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Furnished */}
          <button
            onClick={() => setFilters({ furnished: !filters.furnished ? true : undefined })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.furnished
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filters.furnished && <Check className="w-3.5 h-3.5 text-brand-600" />}
            <span>{t.furnished}</span>
          </button>

          {/* Near Metro */}
          <button
            onClick={() => setFilters({ nearMetro: !filters.nearMetro ? true : undefined })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.nearMetro
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filters.nearMetro && <Check className="w-3.5 h-3.5 text-brand-600" />}
            <span>{t.nearMetro}</span>
          </button>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-auto"
            title={t.resetFilters}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.resetFilters}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
