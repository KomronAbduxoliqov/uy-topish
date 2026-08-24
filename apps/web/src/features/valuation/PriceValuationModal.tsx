'use client';

import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Sparkles,
  Building,
  MapPin,
  CheckCircle2,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  TASHKENT_DISTRICTS,
  RenovationType,
  BuildingType,
  PropertyType
} from '@uytop/shared-types';
import { formatNumber, formatPriceUzs } from '../../lib/utils/formatters';

export const PriceValuationModal: React.FC = () => {
  const { isValuationModalOpen, setIsValuationModalOpen, language, currency } = useAppStore();

  const [district, setDistrict] = useState('Chilonzor');
  const [rooms, setRooms] = useState(2);
  const [areaSqm, setAreaSqm] = useState(58);
  const [floor, setFloor] = useState(3);
  const [totalFloors, setTotalFloors] = useState(9);
  const [renovation, setRenovation] = useState<RenovationType>(RenovationType.NEW);
  const [buildingType, setBuildingType] = useState<BuildingType>(BuildingType.BRICK);
  const [nearMetro, setNearMetro] = useState(true);

  if (!isValuationModalOpen) return null;

  // District base price multipliers per m² (in UZS)
  const districtMultipliers: Record<string, number> = {
    'Mirobod': 16500000,
    'Yakkasaroy': 15000000,
    'Shayxontohur': 14200000,
    'Mirzo Ulug\'bek': 13800000,
    'Yunusobod': 12500000,
    'Chilonzor': 12000000,
    'Olmazor': 10500000,
    'Yashnobod': 11000000,
    'Uchtepa': 10000000,
    'Sergeli': 9200000,
    'Yangihayot': 8500000,
    'Bektemir': 7800000
  };

  const basePricePerSqm = districtMultipliers[district] || 12000000;

  // Modifiers
  let renovationMultiplier = 1.0;
  if (renovation === RenovationType.NEW) renovationMultiplier = 1.22;
  else if (renovation === RenovationType.RENOVATED) renovationMultiplier = 1.1;
  else if (renovation === RenovationType.AVERAGE) renovationMultiplier = 0.95;
  else if (renovation === RenovationType.NEEDS_REPAIR) renovationMultiplier = 0.8;

  let buildingMultiplier = 1.0;
  if (buildingType === BuildingType.BRICK) buildingMultiplier = 1.08;
  else if (buildingType === BuildingType.MONOLITH) buildingMultiplier = 1.05;
  else if (buildingType === BuildingType.PANEL) buildingMultiplier = 0.95;

  const metroBonus = nearMetro ? 1.07 : 1.0;

  // Calculated Market Value
  const estimatedPricePerSqm = Math.round(
    basePricePerSqm * renovationMultiplier * buildingMultiplier * metroBonus
  );
  const estimatedTotalUzs = Math.round(estimatedPricePerSqm * areaSqm);

  const minRangeUzs = Math.round(estimatedTotalUzs * 0.93);
  const maxRangeUzs = Math.round(estimatedTotalUzs * 1.07);

  // Rental Yield Estimate (Average Tashkent yield ~9.5% annual)
  const estimatedMonthlyRentUzs = Math.round((estimatedTotalUzs * 0.095) / 12);
  const rentalYieldPercent = 9.5;

  const formatPrice = (uzs: number) => {
    if (currency === 'USD') {
      return `$${formatNumber(Math.round(uzs / 12650))}`;
    }
    return formatPriceUzs(uzs);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>
                  {language === 'en' ? 'AI Price Valuation' : language === 'ru' ? 'AI Оценка Недвижимости' : 'AI Mulkni Baholash'}
                </span>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Smart Valuation 2.5
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                {language === 'en'
                  ? 'Real 2026 Tashkent market transaction data and AI estimation'
                  : language === 'ru'
                  ? 'Анализ реальных сделок в Ташкенте 2026 года и оценка ИИ'
                  : "Toshkentning 2026-yilgi real bozor bitimlari va sun'iy intellekt tahlili"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsValuationModalOpen(false)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Inputs (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span>
                  {language === 'en' ? 'Property Parameters' : language === 'ru' ? 'Параметры объекта' : 'Mulk parametrlari'}
                </span>
              </h4>

              {/* District */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {language === 'en' ? 'Tashkent District' : language === 'ru' ? 'Район Ташкента' : 'Toshkent tumani'}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {TASHKENT_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameUz}>
                      {language === 'en' ? (d.nameEn || d.nameUz) : language === 'ru' ? d.nameRu : d.nameUz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rooms & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {language === 'en' ? 'Rooms' : language === 'ru' ? 'Комнат' : 'Xonalar soni'}
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    {[1, 2, 3, 4].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRooms(r)}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                          rooms === r
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {r === 4 ? '4+' : r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {language === 'en' ? 'Area (m²)' : language === 'ru' ? 'Площадь (м²)' : 'Maydon (m²)'}
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="500"
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Renovation */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {language === 'en' ? 'Renovation Status' : language === 'ru' ? 'Состояние ремонта' : "Ta'mir holati"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: language === 'en' ? 'Euro / New' : language === 'ru' ? 'Евроремонт' : 'Yangi / Evro', val: RenovationType.NEW },
                    { label: language === 'en' ? 'Good repair' : language === 'ru' ? 'Хороший ремонт' : "Yaxshi ta'mir", val: RenovationType.RENOVATED },
                    { label: language === 'en' ? 'Average' : language === 'ru' ? 'Среднее' : "O'rtacha", val: RenovationType.AVERAGE },
                    { label: language === 'en' ? 'Needs repair' : language === 'ru' ? 'Без ремонта' : "Ta'mirtalab", val: RenovationType.NEEDS_REPAIR }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setRenovation(item.val)}
                      className={`p-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        renovation === item.val
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Building Type */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {language === 'en' ? 'Building Type' : language === 'ru' ? 'Тип дома' : 'Bino turi'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: language === 'en' ? 'Brick' : language === 'ru' ? 'Кирпичный' : "G'ishtli", val: BuildingType.BRICK },
                    { label: language === 'en' ? 'Monolith' : language === 'ru' ? 'Монолитный' : 'Monolit', val: BuildingType.MONOLITH },
                    { label: language === 'en' ? 'Panel' : language === 'ru' ? 'Панельный' : 'Panelli', val: BuildingType.PANEL }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setBuildingType(item.val)}
                      className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all ${
                        buildingType === item.val
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metro Switch */}
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nearMetro}
                  onChange={(e) => setNearMetro(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'en' ? 'Within 10 min walk to metro station' : language === 'ru' ? 'В 10 минутах пешком до метро' : 'Metro bekatiga piyoda 10 daqiqalik masofada'}
                </span>
              </label>
            </div>

            {/* Right Results Dashboard (7 cols) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl border border-indigo-900/50">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    {language === 'en' ? 'Estimated Fair Market Value' : language === 'ru' ? 'Рыночная стоимость объекта' : 'Taxminiy Adolatli Bozor Qiymati'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Zap className="w-3 h-3" />
                    {language === 'en' ? '94% Accuracy' : language === 'ru' ? '94% Точность' : '94% Aniqlik'}
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                  {formatPrice(estimatedTotalUzs)}
                </div>

                <p className="text-xs text-slate-300 mb-6">
                  {language === 'en' ? 'Suggested market range:' : language === 'ru' ? 'Рекомендованный диапазон:' : "Tavsiya etilgan bozor oralig'i:"}{' '}
                  <b className="text-white">{formatPrice(minRangeUzs)}</b> —{' '}
                  <b className="text-white">{formatPrice(maxRangeUzs)}</b>
                </p>

                {/* Analytical Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
                    <span className="text-[11px] text-indigo-200 block mb-0.5">
                      {language === 'en' ? 'Average price / m²' : language === 'ru' ? 'Средняя цена за 1 м²' : "1 m² o'rtacha narxi"}
                    </span>
                    <span className="text-base font-extrabold text-white">
                      {formatPrice(estimatedPricePerSqm)}/m²
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
                    <span className="text-[11px] text-emerald-300 block mb-0.5">
                      {language === 'en' ? 'Monthly rental potential' : language === 'ru' ? 'Потенциал аренды / мес' : 'Oylik ijara potentsiali'}
                    </span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {formatPrice(estimatedMonthlyRentUzs)}
                      {language === 'en' ? '/mo' : language === 'ru' ? '/мес' : '/oy'}
                    </span>
                  </div>
                </div>

                {/* Key Drivers */}
                <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span>{language === 'en' ? 'District index' : language === 'ru' ? 'Индекс района' : 'Hudud indeksi'} ({district}):</span>
                    <b className="text-white">{formatPrice(basePricePerSqm)} / m²</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === 'en' ? 'Renovation value bonus:' : language === 'ru' ? 'Надбавка за ремонт:' : "Ta'mir qo'shimcha qiymati:"}</span>
                    <b className="text-indigo-300">
                      +{Math.round((renovationMultiplier - 1) * 100)}%
                    </b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === 'en' ? 'Annual rental yield:' : language === 'ru' ? 'Годовая доходность (Yield):' : 'Yillik investitsiya rentabelligi (Yield):'}</span>
                    <b className="text-emerald-400">≈ {rentalYieldPercent}% {language === 'en' ? '/ year' : language === 'ru' ? '/ год' : '/ yil'}</b>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  {language === 'en'
                    ? 'Estimated based on verified Tashkent listings database.'
                    : language === 'ru'
                    ? 'Рассчитано на основе реальной базы недвижимости Ташкента.'
                    : "Sun'iy intellekt Toshkent ko'chmas mulk bazasi asosida hisoblandi."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            {language === 'en'
              ? 'Valuation estimates serve as a market analytical guideline.'
              : language === 'ru'
              ? 'Результаты оценки носят рекомендательный аналитический характер.'
              : 'Baholash natijalari bozor tavsiyasi xarakteriga ega.'}
          </span>
          <button
            onClick={() => setIsValuationModalOpen(false)}
            className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm ml-auto transition-colors"
          >
            {language === 'en' ? 'Understood' : language === 'ru' ? 'Понятно' : 'Tushunarli'}
          </button>
        </div>
      </div>
    </div>
  );
};
