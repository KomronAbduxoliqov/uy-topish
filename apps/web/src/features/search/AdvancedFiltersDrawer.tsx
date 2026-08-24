'use client';

import React from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const AREA_CHIPS = [
  { label: '30-50', min: 30, max: 50 },
  { label: '50-80', min: 50, max: 80 },
  { label: '80-120', min: 80, max: 120 },
  { label: '120+', min: 120, max: undefined },
];

const BUILDING_TYPES = [
  { id: 'brick', uz: "G'isht", ru: 'Кирпич', en: 'Brick' },
  { id: 'panel', uz: 'Panel', ru: 'Панель', en: 'Panel' },
  { id: 'monolith', uz: 'Monolit', ru: 'Монолит', en: 'Monolith' },
  { id: 'block', uz: 'Blok', ru: 'Блок', en: 'Block' }
];

const RENOVATION_TYPES = [
  { id: 'new', uz: 'Yangi evro', ru: 'Евроремонт', en: 'Euro Renovation' },
  { id: 'cosmetic', uz: 'Kosmetik', ru: 'Косметический', en: 'Cosmetic' },
  { id: 'average', uz: "O'rtacha", ru: 'Средний', en: 'Average' },
  { id: 'needs_repair', uz: "Ta'mirsiz", ru: 'Без ремонта', en: 'Needs Renovation' }
];

export function AdvancedFiltersDrawer() {
  const {
    isAdvancedFiltersOpen,
    setIsAdvancedFiltersOpen,
    advancedFilters,
    setAdvancedFilters,
    resetAdvancedFilters,
    language
  } = useAppStore();

  if (!isAdvancedFiltersOpen) return null;

  const handleClose = () => setIsAdvancedFiltersOpen(false);

  const toggleArrayItem = (key: 'buildingType' | 'renovation', value: string) => {
    const current = advancedFilters[key] || [];
    if (current.includes(value)) {
      setAdvancedFilters({ [key]: current.filter((item) => item !== value) });
    } else {
      setAdvancedFilters({ [key]: [...current, value] });
    }
  };

  const activeCount = Object.values(advancedFilters).filter((val) => {
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'boolean') return val === true;
    return val !== undefined && val !== null;
  }).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 w-full sm:w-96 max-w-full bg-white shadow-2xl z-50 flex flex-col rounded-r-3xl animate-slideRight"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {language === 'en' ? 'Advanced Filters' : language === 'ru' ? 'Дополнительные фильтры' : "Qo'shimcha filtrlar"}
              </h2>
              {activeCount > 0 && (
                <p className="text-sm text-brand-600 font-medium">
                  {activeCount} {language === 'en' ? 'active filters' : language === 'ru' ? 'фильтров активно' : 'ta filtr faol'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Maydon (Area) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {language === 'en' ? 'Area (m²)' : language === 'ru' ? 'Площадь (м²)' : 'Maydon (m²)'}
            </h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder={language === 'en' ? 'from' : language === 'ru' ? 'от' : 'dan'}
                value={advancedFilters.minArea || ''}
                onChange={(e) =>
                  setAdvancedFilters({ minArea: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              <input
                type="number"
                placeholder={language === 'en' ? 'to' : language === 'ru' ? 'до' : 'gacha'}
                value={advancedFilters.maxArea || ''}
                onChange={(e) =>
                  setAdvancedFilters({ maxArea: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {AREA_CHIPS.map((chip) => {
                const isActive =
                  advancedFilters.minArea === chip.min && advancedFilters.maxArea === chip.max;
                return (
                  <button
                    key={chip.label}
                    onClick={() =>
                      setAdvancedFilters({ minArea: chip.min, maxArea: chip.max })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Qavat (Floor) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {language === 'en' ? 'Floor' : language === 'ru' ? 'Этаж' : 'Qavat'}
            </h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder={language === 'en' ? 'from' : language === 'ru' ? 'от' : 'dan'}
                value={advancedFilters.minFloor || ''}
                onChange={(e) =>
                  setAdvancedFilters({ minFloor: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              <input
                type="number"
                placeholder={language === 'en' ? 'to' : language === 'ru' ? 'до' : 'gacha'}
                value={advancedFilters.maxFloor || ''}
                onChange={(e) =>
                  setAdvancedFilters({ maxFloor: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advancedFilters.notFirstFloor || false}
                  onChange={(e) => setAdvancedFilters({ notFirstFloor: e.target.checked })}
                  className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <span className="text-slate-700 text-sm">
                  {language === 'en' ? 'Not first floor' : language === 'ru' ? 'Не первый этаж' : 'Birinchi qavat emas'}
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advancedFilters.notLastFloor || false}
                  onChange={(e) => setAdvancedFilters({ notLastFloor: e.target.checked })}
                  className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <span className="text-slate-700 text-sm">
                  {language === 'en' ? 'Not top floor' : language === 'ru' ? 'Не последний этаж' : 'Oxirgi qavat emas'}
                </span>
              </label>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Bino turi */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {language === 'en' ? 'Building Type' : language === 'ru' ? 'Тип дома' : 'Bino turi'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {BUILDING_TYPES.map((b) => {
                const label = language === 'en' ? b.en : language === 'ru' ? b.ru : b.uz;
                const isActive = advancedFilters.buildingType?.includes(b.uz);
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleArrayItem('buildingType', b.uz)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-2 border-brand-200'
                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Ta'mir holati */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {language === 'en' ? 'Renovation' : language === 'ru' ? 'Ремонт' : "Ta'mir holati"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {RENOVATION_TYPES.map((r) => {
                const label = language === 'en' ? r.en : language === 'ru' ? r.ru : r.uz;
                const isActive = advancedFilters.renovation?.includes(r.uz);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleArrayItem('renovation', r.uz)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-2 border-brand-200'
                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Qo'shimcha shartlar */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {language === 'en' ? 'Additional Amenities' : language === 'ru' ? 'Дополнительные удобства' : "Qo'shimcha shartlar"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'hasLift', uz: 'Lift mavjud', ru: 'Есть лифт', en: 'Elevator' },
                { key: 'hasParking', uz: 'Avtoturargoh', ru: 'Парковка', en: 'Parking' },
                { key: 'hasBalcony', uz: 'Balkon', ru: 'Балкон', en: 'Balcony' },
                { key: 'hasAC', uz: 'Konditsioner', ru: 'Кондиционер', en: 'Air Conditioning' },
              ].map(({ key, uz, ru, en }) => {
                const typedKey = key as keyof typeof advancedFilters;
                const isActive = advancedFilters[typedKey] === true;
                const label = language === 'en' ? en : language === 'ru' ? ru : uz;
                return (
                  <button
                    key={key}
                    onClick={() => setAdvancedFilters({ [key]: !isActive })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-2 border-brand-200'
                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white rounded-br-3xl flex gap-3">
          <button
            onClick={resetAdvancedFilters}
            className="px-4 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {language === 'en' ? 'Reset' : language === 'ru' ? 'Сбросить' : 'Tozalash'}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20"
          >
            {language === 'en' ? 'Apply' : language === 'ru' ? 'Применить' : "Qo'llash"}
          </button>
        </div>
      </div>
    </>
  );
}
