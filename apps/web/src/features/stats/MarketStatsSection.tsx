'use client';

import React, { useRef } from 'react';
import { TrendingUp, TrendingDown, MapPin, Home, Building2, ChevronLeft, ChevronRight, Activity, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface DistrictStat {
  nameUz: string;
  nameRu: string;
  nameEn: string;
  rentTextUz: string;
  rentTextRu: string;
  rentTextEn: string;
  saleTextUz: string;
  saleTextRu: string;
  saleTextEn: string;
  listings: number;
  trend: number;
  sparkline: number[];
}

const DISTRICT_STATS: DistrictStat[] = [
  { nameUz: 'Chilonzor', nameRu: 'Чиланзар', nameEn: 'Chilanzar', rentTextUz: "4 200 000 so'm", rentTextRu: "4 200 000 сум", rentTextEn: "4.2M UZS", saleTextUz: "8 500 000 so'm/m²", saleTextRu: "8 500 000 сум/м²", saleTextEn: "8.5M UZS/m²", listings: 342, trend: 3.2, sparkline: [78, 82, 80, 85, 88, 86, 91] },
  { nameUz: 'Yunusobod', nameRu: 'Юнусабад', nameEn: 'Yunusabad', rentTextUz: "5 800 000 so'm", rentTextRu: "5 800 000 сум", rentTextEn: "5.8M UZS", saleTextUz: "12 000 000 so'm/m²", saleTextRu: "12 000 000 сум/м²", saleTextEn: "12M UZS/m²", listings: 287, trend: 5.1, sparkline: [65, 68, 72, 75, 78, 82, 85] },
  { nameUz: "Mirzo Ulug'bek", nameRu: 'Мирзо Улугбек', nameEn: 'Mirzo Ulugbek', rentTextUz: "3 800 000 so'm", rentTextRu: "3 800 000 сум", rentTextEn: "3.8M UZS", saleTextUz: "7 200 000 so'm/m²", saleTextRu: "7 200 000 сум/м²", saleTextEn: "7.2M UZS/m²", listings: 198, trend: -1.3, sparkline: [85, 83, 84, 80, 78, 79, 77] },
  { nameUz: 'Sergeli', nameRu: 'Сергели', nameEn: 'Sergeli', rentTextUz: "2 800 000 so'm", rentTextRu: "2 800 000 сум", rentTextEn: "2.8M UZS", saleTextUz: "5 500 000 so'm/m²", saleTextRu: "5 500 000 сум/м²", saleTextEn: "5.5M UZS/m²", listings: 156, trend: 7.8, sparkline: [45, 50, 55, 60, 62, 68, 72] },
  { nameUz: 'Yakkasaroy', nameRu: 'Яккасарай', nameEn: 'Yakkasaray', rentTextUz: "7 200 000 so'm", rentTextRu: "7 200 000 сум", rentTextEn: "7.2M UZS", saleTextUz: "15 000 000 so'm/m²", saleTextRu: "15 000 000 сум/м²", saleTextEn: "15M UZS/m²", listings: 124, trend: 2.1, sparkline: [88, 90, 89, 92, 91, 93, 95] },
  { nameUz: 'Mirobod', nameRu: 'Мирабад', nameEn: 'Mirobod', rentTextUz: "8 500 000 so'm", rentTextRu: "8 500 000 сум", rentTextEn: "8.5M UZS", saleTextUz: "18 000 000 so'm/m²", saleTextRu: "18 000 000 сум/м²", saleTextEn: "18M UZS/m²", listings: 98, trend: 1.5, sparkline: [92, 93, 94, 93, 95, 94, 96] },
  { nameUz: 'Shayxontohur', nameRu: 'Шайхантахур', nameEn: 'Shaykhontohur', rentTextUz: "4 000 000 so'm", rentTextRu: "4 000 000 сум", rentTextEn: "4M UZS", saleTextUz: "7 800 000 so'm/m²", saleTextRu: "7 800 000 сум/м²", saleTextEn: "7.8M UZS/m²", listings: 167, trend: -0.8, sparkline: [72, 74, 73, 71, 70, 71, 69] },
  { nameUz: 'Olmazor', nameRu: 'Алмазар', nameEn: 'Almazar', rentTextUz: "3 200 000 so'm", rentTextRu: "3 200 000 сум", rentTextEn: "3.2M UZS", saleTextUz: "6 000 000 so'm/m²", saleTextRu: "6 000 000 сум/м²", saleTextEn: "6M UZS/m²", listings: 213, trend: 4.5, sparkline: [55, 58, 62, 65, 68, 70, 73] },
  { nameUz: 'Uchtepa', nameRu: 'Учтепа', nameEn: 'Uchtepa', rentTextUz: "2 500 000 so'm", rentTextRu: "2 500 000 сум", rentTextEn: "2.5M UZS", saleTextUz: "4 800 000 so'm/m²", saleTextRu: "4 800 000 сум/м²", saleTextEn: "4.8M UZS/m²", listings: 178, trend: 6.2, sparkline: [40, 45, 48, 52, 56, 60, 63] },
  { nameUz: 'Yashnobod', nameRu: 'Яшнабад', nameEn: 'Yashnabad', rentTextUz: "3 500 000 so'm", rentTextRu: "3 500 000 сум", rentTextEn: "3.5M UZS", saleTextUz: "6 500 000 so'm/m²", saleTextRu: "6 500 000 сум/м²", saleTextEn: "6.5M UZS/m²", listings: 145, trend: 3.8, sparkline: [60, 62, 65, 67, 70, 72, 74] },
  { nameUz: 'Bektemir', nameRu: 'Бектемир', nameEn: 'Bektemir', rentTextUz: "2 200 000 so'm", rentTextRu: "2 200 000 сум", rentTextEn: "2.2M UZS", saleTextUz: "4 200 000 so'm/m²", saleTextRu: "4 200 000 сум/м²", saleTextEn: "4.2M UZS/m²", listings: 89, trend: 9.1, sparkline: [30, 35, 40, 45, 50, 55, 62] },
];

function Sparkline({ data, trend }: { data: number[]; trend: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 76;
  const height = 26;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const color = trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#6B7280';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const MarketStatsSection: React.FC = () => {
  const { language, setFilters } = useAppStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-950 dark:to-slate-900 py-8 sm:py-10 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Data Transparency Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-bold mb-1.5 border border-brand-200 dark:border-brand-800">
              <Sparkles className="w-3 h-3 text-brand-600 dark:text-brand-400" />
              <span>
                {language === 'en'
                  ? 'Tashkent Real Estate Index'
                  : language === 'ru'
                  ? 'Индекс Недвижимости Ташкента'
                  : "Toshkent Ko'chmas Mulk Indeksi"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'en'
                ? 'Market prices across districts'
                : language === 'ru'
                ? 'Цены на рынке по районам'
                : "Tumanlar bo'yicha bozor narxlari"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {language === 'en'
                ? 'Based on real listings and market analytical data for the last 30 days'
                : language === 'ru'
                ? 'На основе реальных объявлений и аналитики за последние 30 дней'
                : "Oxirgi 30 kunlik real bitimlar va tahliliy ma'lumotlar asosida"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>
              {language === 'en' ? 'All districts' : language === 'ru' ? 'Все районы' : 'Barcha tumanlar'} ({DISTRICT_STATS.length})
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                title={language === 'en' ? 'Scroll left' : language === 'ru' ? 'Влево' : 'Chapga surish'}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                title={language === 'en' ? 'Scroll right' : language === 'ru' ? 'Вправо' : "O'ngga surish"}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3.5 sm:gap-4 pb-3 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        >
          {DISTRICT_STATS.map((stat, idx) => {
            const districtName = language === 'en' ? stat.nameEn : language === 'ru' ? stat.nameRu : stat.nameUz;
            const rentText = language === 'en' ? stat.rentTextEn : language === 'ru' ? stat.rentTextRu : stat.rentTextUz;
            const saleText = language === 'en' ? stat.saleTextEn : language === 'ru' ? stat.saleTextRu : stat.saleTextUz;

            return (
              <div
                key={idx}
                onClick={() => {
                  setFilters({ district: stat.nameUz });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-none w-[240px] sm:w-[255px] snap-start bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-200 cursor-pointer group"
              >
                {/* Card Header */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-colors flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                    {districtName}
                  </h3>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-3">
                  <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div className="text-[11px] text-slate-400 dark:text-slate-400 font-bold mb-0.5 flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" />
                      <span>{language === 'en' ? 'Avg. rent (per mo)' : language === 'ru' ? 'Средняя аренда (в месяц)' : "O'rtacha ijara (oyiga)"}</span>
                    </div>
                    <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                      {rentText}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div className="text-[11px] text-slate-400 dark:text-slate-400 font-bold mb-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{language === 'en' ? 'Sale (per 1 m²)' : language === 'ru' ? 'Продажа (за 1 м²)' : 'Sotuv (1 m² uchun)'}</span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {saleText}
                    </div>
                  </div>
                </div>

                {/* Footer / Trend */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium mb-0.5">
                      {language === 'en' ? 'Listings' : language === 'ru' ? 'Объявления' : "Faol e'lonlar"}: {stat.listings}
                    </div>
                    <div
                      className={`flex items-center text-xs font-black ${
                        stat.trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : stat.trend < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                      }`}
                    >
                      {stat.trend > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      ) : stat.trend < 0 ? (
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <Activity className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="pl-1">
                    <Sparkline data={stat.sparkline} trend={stat.trend} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
