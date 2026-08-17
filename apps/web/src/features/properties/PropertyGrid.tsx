import React from 'react';
import { PropertyCard } from './PropertyCard';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { Home, Sparkles } from 'lucide-react';

export const PropertyGrid: React.FC = () => {
  const { properties, isLoadingProperties, language, resetFilters } = useAppStore();
  const t = translations[language];

  if (isLoadingProperties) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
            <div className="aspect-[16/10] bg-slate-200 rounded-xl mb-3" />
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Home className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t.noListingsFound}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Qidiruv parametrlarini biroz kengaytirib ko'ring yoki boshqa hududni tanlang.
        </p>
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
        >
          {t.resetFilters}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header result count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-900">
          {properties.length} {t.foundListings}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};
