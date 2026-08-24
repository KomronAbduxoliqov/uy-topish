'use client';

import React, { useEffect, useState } from 'react';
import { X, Scale, Check, Minus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { apiClient } from '../../lib/api/client';
import { PropertyComparisonResult, UZBEK_AMENITIES } from '@uytop/shared-types';
import { formatNumber, formatPriceUzs } from '../../lib/utils/formatters';

export const PropertyCompareModal: React.FC = () => {
  const {
    isCompareModalOpen,
    setIsCompareModalOpen,
    compareList,
    toggleCompare,
    clearCompare,
    language
  } = useAppStore();

  const t = translations[language];
  const [data, setData] = useState<PropertyComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isCompareModalOpen && compareList.length > 0) {
      loadComparison();
    }
  }, [isCompareModalOpen, compareList]);

  const loadComparison = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.compareProperties(compareList);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCompareModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t.compareProperties}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {compareList.length} {language === 'en' ? 'properties selected' : language === 'ru' ? 'объектов выбрано' : 'ta mulk tanlangan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="flex items-center gap-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'en' ? 'Clear' : language === 'ru' ? 'Очистить' : 'Tozalash'}</span>
            </button>
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto p-6 bg-white dark:bg-slate-900">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              {language === 'en' ? 'Calculating comparison...' : language === 'ru' ? 'Сравнение рассчитывается...' : 'Taqqoslash hisoblanmoqda...'}
            </div>
          ) : !data || data.properties.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              {language === 'en' ? 'No properties selected for comparison' : language === 'ru' ? 'Нет объектов для сравнения' : 'Taqqoslash uchun mulk tanlanmagan'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-48">
                    {language === 'en' ? 'Property' : language === 'ru' ? 'Объект' : 'Mulk'}
                  </th>
                  {data.properties.map((p) => {
                    const title = language === 'en' ? (p.titleEn || p.titleUz) : language === 'ru' ? (p.titleRu || p.titleUz) : p.titleUz;
                    return (
                      <th key={p.id} className="p-3 min-w-[200px] align-top">
                        <div className="relative group bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                          <img
                            src={p.images?.[0]?.originalUrl || ''}
                            alt={title}
                            className="w-full h-24 object-cover rounded-xl mb-2"
                          />
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 mb-1">{title}</h4>
                          <div className="text-sm font-extrabold text-brand-700 dark:text-brand-400">
                            {formatPriceUzs(p.priceUzs)}
                          </div>
                          <button
                            onClick={() => toggleCompare(p.id)}
                            className="absolute -top-2 -right-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-600 p-1 rounded-full shadow border border-slate-200 dark:border-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* 1 m² narxi */}
                <tr>
                  <td className="p-3 font-bold text-slate-600 dark:text-slate-300">
                    {language === 'en' ? 'Price per m²' : language === 'ru' ? 'Цена за 1 м²' : '1 m² narxi'}
                  </td>
                  {data.properties.map((p) => {
                    const pricePerSqm = Math.round(p.priceUzs / p.areaSqm);
                    return (
                      <td key={p.id} className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatNumber(pricePerSqm)} {language === 'en' ? 'UZS/m²' : language === 'ru' ? 'сум/м²' : "so'm/m²"}
                      </td>
                    );
                  })}
                </tr>

                {/* Xonalar soni */}
                <tr>
                  <td className="p-3 font-bold text-slate-600 dark:text-slate-300">
                    {language === 'en' ? 'Rooms' : language === 'ru' ? 'Количество комнат' : 'Xonalar soni'}
                  </td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {p.rooms} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'}
                    </td>
                  ))}
                </tr>

                {/* Maydon */}
                <tr>
                  <td className="p-3 font-bold text-slate-600 dark:text-slate-300">
                    {language === 'en' ? 'Total Area' : language === 'ru' ? 'Общая площадь' : 'Umumiy maydon'}
                  </td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 font-semibold text-slate-800 dark:text-slate-200">{p.areaSqm} m²</td>
                  ))}
                </tr>

                {/* Qavat */}
                <tr>
                  <td className="p-3 font-bold text-slate-600 dark:text-slate-300">
                    {language === 'en' ? 'Floor' : language === 'ru' ? 'Этаж' : 'Qavat'}
                  </td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {p.floor || 1} / {p.totalFloors || 9}
                    </td>
                  ))}
                </tr>

                {/* Tuman va Manzil */}
                <tr>
                  <td className="p-3 font-bold text-slate-600 dark:text-slate-300">
                    {language === 'en' ? 'Address' : language === 'ru' ? 'Адрес' : 'Manzil'}
                  </td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 text-slate-600 dark:text-slate-400">
                      {p.district}, {p.addressLine}
                    </td>
                  ))}
                </tr>

                {/* Metro bekatigacha masofa */}
                <tr>
                  <td className="p-3 font-bold text-slate-600 dark:text-slate-300">
                    {language === 'en' ? 'Metro Station' : language === 'ru' ? 'Метро' : 'Metro'}
                  </td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 text-brand-700 dark:text-brand-400 font-semibold">
                      {p.nearestMetroStation ? `${p.nearestMetroStation} (${p.nearestMetroDistanceMeters || 400}m)` : '-'}
                    </td>
                  ))}
                </tr>

                {/* Qulayliklar taqqoslash */}
                {UZBEK_AMENITIES.slice(0, 6).map((amenity) => (
                  <tr key={amenity.key}>
                    <td className="p-3 font-medium text-slate-500 dark:text-slate-400">
                      {language === 'en' ? (amenity.nameEn || amenity.nameUz) : language === 'ru' ? amenity.nameRu : amenity.nameUz}
                    </td>
                    {data.properties.map((p) => {
                      const has = p.amenities && p.amenities[amenity.key];
                      return (
                        <td key={p.id} className="p-3">
                          {has ? (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
