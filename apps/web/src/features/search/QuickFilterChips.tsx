'use client';

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TransactionType, PropertySearchFilters } from '@uytop/shared-types';

interface PresetFilter {
  id: string;
  label: {
    uz: string;
    ru: string;
    en: string;
  };
  filters: Partial<PropertySearchFilters>;
  isActive: (filters: PropertySearchFilters) => boolean;
}

const PRESET_CHIPS: PresetFilter[] = [
  {
    id: 'eng_arzon',
    label: {
      uz: '🔥 Eng arzon',
      ru: '🔥 Самые дешевые',
      en: '🔥 Cheapest'
    },
    filters: {
      sortBy: 'price_asc',
      transactionType: TransactionType.RENT
    },
    isActive: (filters) =>
      filters.sortBy === 'price_asc' &&
      (filters.transactionType === TransactionType.RENT || !filters.transactionType) &&
      !filters.district &&
      !filters.maxPrice &&
      !filters.nearMetro &&
      !filters.furnished &&
      (!filters.rooms || filters.rooms.length === 0)
  },
  {
    id: 'chilonzorda',
    label: {
      uz: '🏠 Chilonzorda',
      ru: '🏠 На Чиланзаре',
      en: '🏠 In Chilanzar'
    },
    filters: {
      district: 'Chilonzor',
      transactionType: TransactionType.RENT
    },
    isActive: (filters) =>
      filters.district === 'Chilonzor' &&
      (filters.transactionType === TransactionType.RENT || !filters.transactionType)
  },
  {
    id: 'metroga_yaqin',
    label: {
      uz: '🚇 Metroga yaqin',
      ru: '🚇 Рядом с метро',
      en: '🚇 Near Metro'
    },
    filters: {
      nearMetro: true,
      transactionType: TransactionType.RENT
    },
    isActive: (filters) =>
      filters.nearMetro === true &&
      (filters.transactionType === TransactionType.RENT || !filters.transactionType)
  },
  {
    id: 'yangi_tamir',
    label: {
      uz: "💎 Yangi ta'mir",
      ru: '💎 С новым ремонтом',
      en: '💎 Renovated'
    },
    filters: {
      furnished: true,
      transactionType: TransactionType.RENT
    },
    isActive: (filters) =>
      filters.furnished === true &&
      (filters.transactionType === TransactionType.RENT || !filters.transactionType) &&
      (!filters.rooms || filters.rooms.length === 0)
  },
  {
    id: 'yunusobodda',
    label: {
      uz: '🏢 Yunusobodda',
      ru: '🏢 На Юнусабаде',
      en: '🏢 In Yunusabad'
    },
    filters: {
      district: 'Yunusobod',
      transactionType: TransactionType.RENT
    },
    isActive: (filters) =>
      filters.district === 'Yunusobod' &&
      (filters.transactionType === TransactionType.RENT || !filters.transactionType)
  },
  {
    id: 'under_3m',
    label: {
      uz: '💰 3 mln gacha',
      ru: '💰 До 3 млн',
      en: '💰 Under 3M'
    },
    filters: {
      maxPrice: 3000000,
      transactionType: TransactionType.RENT
    },
    isActive: (filters) =>
      filters.maxPrice === 3000000 &&
      (filters.transactionType === TransactionType.RENT || !filters.transactionType)
  },
  {
    id: 'mebelli_2xona',
    label: {
      uz: '🛋️ Mebelli 2 xona',
      ru: '🛋️ 2-комн. с мебелью',
      en: '🛋️ 2-Room Furnished'
    },
    filters: {
      rooms: [2],
      furnished: true,
      transactionType: TransactionType.RENT
    },
    isActive: (filters) =>
      filters.furnished === true &&
      Array.isArray(filters.rooms) &&
      filters.rooms.length === 1 &&
      filters.rooms[0] === 2 &&
      (filters.transactionType === TransactionType.RENT || !filters.transactionType)
  },
  {
    id: 'sotuvga',
    label: {
      uz: '🏷️ Sotuvga',
      ru: '🏷️ На продажу',
      en: '🏷️ For Sale'
    },
    filters: {
      transactionType: TransactionType.SALE
    },
    isActive: (filters) => filters.transactionType === TransactionType.SALE
  },
  {
    id: 'kunlik_ijara',
    label: {
      uz: '📅 Kunlik ijara',
      ru: '📅 Посуточно',
      en: '📅 Daily Rent'
    },
    filters: {
      transactionType: TransactionType.DAILY
    },
    isActive: (filters) => filters.transactionType === TransactionType.DAILY
  }
];

interface QuickFilterChipsProps {
  className?: string;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({ className = '' }) => {
  const { language, filters, setFilters, resetFilters } = useAppStore();

  const handleChipClick = (preset: PresetFilter) => {
    const isCurrentlyActive = preset.isActive(filters);

    if (isCurrentlyActive) {
      resetFilters();
    } else {
      resetFilters();
      setFilters(preset.filters);
    }
  };

  return (
    <div
      className={`overflow-x-auto flex flex-nowrap items-center gap-2 py-2 px-3 scrollbar-hide scroll-smooth select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`}
    >
      {PRESET_CHIPS.map((preset) => {
        const active = preset.isActive(filters);
        const labelText = language === 'en' ? preset.label.en : language === 'ru' ? preset.label.ru : preset.label.uz;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleChipClick(preset)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold border whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
              active
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm ring-2 ring-brand-500/20'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            }`}
          >
            {labelText}
          </button>
        );
      })}
    </div>
  );
};
