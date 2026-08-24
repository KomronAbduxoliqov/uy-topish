'use client';

import React from 'react';
import {
  TrendingUp,
  Train,
  Sparkles,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onSelectRefinement: (refinementType: string) => void;
  isLoading?: boolean;
}

const REFINEMENTS = [
  {
    type: 'INCREASE_BUDGET_500K',
    label: {
      uz: '+500 ming budjet',
      ru: '+500 тыс. бюджет',
      en: '+500K Budget'
    },
    icon: TrendingUp,
    color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900',
  },
  {
    type: 'CLOSER_TO_METRO',
    label: {
      uz: 'Metroga yaqinroq',
      ru: 'Ближе к метро',
      en: 'Near Metro'
    },
    icon: Train,
    color: 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900',
  },
  {
    type: 'ONLY_FURNISHED',
    label: {
      uz: 'Faqat mebelli',
      ru: 'Только с мебелью',
      en: 'Only Furnished'
    },
    icon: Sparkles,
    color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900',
  },
  {
    type: 'CHEAPER_OPTIONS',
    label: {
      uz: 'Arzonroq variantlar',
      ru: 'Подешевле',
      en: 'Cheaper Options'
    },
    icon: DollarSign,
    color: 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700',
  },
  {
    type: 'EXPAND_RADIUS',
    label: {
      uz: 'Radiusni kengaytirish',
      ru: 'Расширить радиус',
      en: 'Expand Radius'
    },
    icon: Maximize2,
    color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900',
  },
];

export const AiQuickRefinement: React.FC<Props> = ({
  onSelectRefinement,
  isLoading
}) => {
  const { language } = useAppStore();

  return (
    <div className="pt-3 pb-1">
      <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2">
        {language === 'en' ? 'Quick Refinements:' : language === 'ru' ? 'Быстрое уточнение:' : 'Tezkor aniqlashtirish:'}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {REFINEMENTS.map((item) => {
          const Icon = item.icon;
          const label = language === 'en' ? item.label.en : language === 'ru' ? item.label.ru : item.label.uz;
          return (
            <button
              key={item.type}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectRefinement(item.type)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border transition-all shadow-2xs active:scale-95 disabled:opacity-50 ${item.color}`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
