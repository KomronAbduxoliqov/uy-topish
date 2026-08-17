import React, { useEffect, useState } from 'react';
import { X, Scale, Check, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { apiClient } from '../../api/client';
import { PropertyComparisonResult, UZBEK_AMENITIES } from '@uytop/shared-types';

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
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">{t.compareProperties}</h3>
              <p className="text-xs text-slate-500">{compareList.length} ta mulk tanlangan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="flex items-center gap-1 text-xs text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Tozalash</span>
            </button>
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto p-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-medium">Taqqoslash hisoblanmoqda...</div>
          ) : !data || data.properties.length === 0 ? (
            <div className="py-12 text-center text-slate-500">Taqqoslash uchun mulk tanlanmagan</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-48">Mulk</th>
                  {data.properties.map((p) => (
                    <th key={p.id} className="p-3 min-w-[200px] align-top">
                      <div className="relative group bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <img
                          src={p.images?.[0]?.originalUrl || ''}
                          alt={p.titleUz}
                          className="w-full h-24 object-cover rounded-xl mb-2"
                        />
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1 mb-1">{p.titleUz}</h4>
                        <div className="text-sm font-extrabold text-brand-700">
                          {p.priceUzs.toLocaleString('uz-UZ')} so'm
                        </div>
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-rose-600 p-1 rounded-full shadow border border-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* 1 m² narxi */}
                <tr>
                  <td className="p-3 font-bold text-slate-600">1 m² narxi</td>
                  {data.properties.map((p) => {
                    const pricePerSqm = Math.round(p.priceUzs / p.areaSqm);
                    return (
                      <td key={p.id} className="p-3 font-semibold text-slate-800">
                        {pricePerSqm.toLocaleString()} so'm/m²
                      </td>
                    );
                  })}
                </tr>

                {/* Xonalar soni */}
                <tr>
                  <td className="p-3 font-bold text-slate-600">Xonalar soni</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 font-semibold text-slate-800">{p.rooms} xona</td>
                  ))}
                </tr>

                {/* Maydon */}
                <tr>
                  <td className="p-3 font-bold text-slate-600">Umumiy maydon</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 font-semibold text-slate-800">{p.areaSqm} m²</td>
                  ))}
                </tr>

                {/* Qavat */}
                <tr>
                  <td className="p-3 font-bold text-slate-600">Qavat</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 font-semibold text-slate-800">
                      {p.floor || 1} / {p.totalFloors || 9}
                    </td>
                  ))}
                </tr>

                {/* Tuman va Manzil */}
                <tr>
                  <td className="p-3 font-bold text-slate-600">Manzil</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 text-slate-600">
                      {p.district}, {p.addressLine}
                    </td>
                  ))}
                </tr>

                {/* Metro bekatigacha masofa */}
                <tr>
                  <td className="p-3 font-bold text-slate-600">Metro</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-3 text-brand-700 font-semibold">
                      {p.nearestMetroStation ? `${p.nearestMetroStation} (${p.nearestMetroDistanceMeters || 400}m)` : '-'}
                    </td>
                  ))}
                </tr>

                {/* Qulayliklar taqqoslash */}
                {UZBEK_AMENITIES.slice(0, 6).map((amenity) => (
                  <tr key={amenity.key}>
                    <td className="p-3 font-medium text-slate-500">{amenity.nameUz}</td>
                    {data.properties.map((p) => {
                      const has = p.amenities && p.amenities[amenity.key];
                      return (
                        <td key={p.id} className="p-3">
                          {has ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300" />
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
