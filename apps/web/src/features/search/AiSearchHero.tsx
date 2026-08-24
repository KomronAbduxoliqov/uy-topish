'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Loader2,
  MapPin,
  Train,
  Home,
  SlidersHorizontal,
  ArrowRight,
  GraduationCap,
  Users,
  Briefcase,
  BadgeDollarSign,
  Building2,
  Flame,
  ShieldCheck,
  Zap,
  Compass,
  Calendar,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { apiClient } from '../../lib/api/client';

export const AiSearchHero: React.FC = () => {
  const {
    language,
    setProperties,
    setIsLoadingProperties,
    setLastParsedAiIntent,
    lastParsedAiIntent,
    setMapSelection,
    setIsAiHomeFinderOpen,
    showToast
  } = useAppStore();

  const t = translations[language];
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'students' | 'family' | 'metro' | 'budget' | 'luxury' | 'house' | 'sale' | 'daily'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fast 1-Click Visual Discovery Presets
  const discoveryPresets = [
    {
      id: 'students',
      icon: GraduationCap,
      labelUz: 'Talabalar uchun',
      labelRu: 'Для студентов',
      labelEn: 'For Students',
      queryUz: 'Talabalar shaharchasida TATU va INHA yaqinida arzon kvartira',
      queryRu: 'Недорогая квартира для студентов возле ТАТУ и ИНХА',
      queryEn: 'Affordable student apartment near TUIT or INHA university',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'family',
      icon: Users,
      labelUz: 'Oila uchun',
      labelRu: 'Для семьи',
      labelEn: 'For Families',
      queryUz: 'Chilonzorda tinch mahallada maktab yaqinida mebelli 2 xonali uy',
      queryRu: '2-комнатная с мебелью в Чиланзаре в тихом районе рядом со школой',
      queryEn: '2-room furnished apartment in quiet neighborhood near school',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'metro',
      icon: Train,
      labelUz: 'Metroga 5 daqiqa',
      labelRu: '5 мин до метро',
      labelEn: '5 min to Metro',
      queryUz: 'Novza yoki Oybek metrosiga piyoda 5 daqiqalik masofada',
      queryRu: 'Возле метро Новза или Ойбек 5 минут пешком',
      queryEn: '5 min walk to Novza or Oybek metro station',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'budget',
      icon: Zap,
      labelUz: 'Arzon & Byudjet',
      labelRu: 'Недорогое жилье',
      labelEn: 'Budget Friendly',
      queryUz: 'Toshkentda 3.5 mln so\'mgacha arzon va toza 1-2 xonali kvartira',
      queryRu: 'Недорогая квартира до 3.5 млн сум в Ташкенте',
      queryEn: 'Affordable clean apartment in Tashkent under 3.5M UZS',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'luxury',
      icon: Sparkles,
      labelUz: 'Tashkent City & Lyuks',
      labelRu: 'Tashkent City / Люкс',
      labelEn: 'Tashkent City / Luxury',
      queryUz: 'Tashkent City yoki Mirabad Avenue da hashamatli lyuks kvartira',
      queryRu: 'Элитная квартира в Tashkent City или Mirabad Avenue',
      queryEn: 'Luxury apartment in Tashkent City or Mirabad Avenue',
      color: 'from-yellow-500 to-amber-600'
    },
    {
      id: 'house',
      icon: Home,
      labelUz: 'Hovli va Villalar',
      labelRu: 'Дома и коттеджи',
      labelEn: 'Houses & Villas',
      queryUz: 'Toshkentda hovli uy yoki basseynli villa',
      queryRu: 'Частный дом или коттедж с бассейном в Ташкенте',
      queryEn: 'Private house or villa with pool in Tashkent',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'sale',
      icon: BadgeDollarSign,
      labelUz: 'Ipotekaga xarid',
      labelRu: 'Ипотека / Покупка',
      labelEn: 'Mortgage / Sale',
      queryUz: 'Yunusobod yoki Sergelida ipoteka bilan yangi kvartira sotiladi',
      queryRu: 'Продажа квартиры в новостройке под ипотеку в Ташкенте',
      queryEn: 'Apartment for sale eligible for mortgage in Tashkent',
      color: 'from-rose-500 to-red-600'
    },
    {
      id: 'daily',
      icon: Calendar,
      labelUz: 'Kunlik ijara',
      labelRu: 'Посуточная аренда',
      labelEn: 'Daily Rental',
      queryUz: 'Shota Rustavelida kunlik ijaraga 2 xonali kvartira',
      queryRu: 'Посуточная аренда 2-комнатной квартиры в центре',
      queryEn: 'Daily rental apartment in central Tashkent',
      color: 'from-sky-500 to-blue-600'
    }
  ];

  // Popular Auto-Suggestions Database
  const suggestionItems = [
    { type: 'district', labelUz: 'Chilonzor tumani', labelRu: 'Чиланзарский район', labelEn: 'Chilanzar district', query: 'Chilonzorda 2 xonali mebelli uy' },
    { type: 'district', labelUz: 'Yunusobod tumani', labelRu: 'Юнусабадский район', labelEn: 'Yunusabad district', query: 'Yunusobodda 3 xonali yangi ta\'mirli' },
    { type: 'district', labelUz: 'Mirzo Ulug\'bek tumani', labelRu: 'Мирзо-Улугбекский район', labelEn: 'Mirzo Ulugbek district', query: 'Mirzo Ulug\'bekda TATU yaqinida' },
    { type: 'district', labelUz: 'Mirobod tumani (Oybek / Markaz)', labelRu: 'Мирабадский район (Ойбек)', labelEn: 'Mirobod district (Oybek)', query: 'Mirobodda Oybek metrosi yaqinida' },
    { type: 'district', labelUz: 'Yakkasaroy tumani (Shota Rustaveli)', labelRu: 'Яккасарайский район', labelEn: 'Yakkasaray district', query: 'Yakkasaroyda Kosmonavtlar yaqinida' },
    { type: 'district', labelUz: 'Olmazor (Talabalar shaharchasi)', labelRu: 'Алмазар (Вузгородок)', labelEn: 'Olmazor (Campus)', query: 'Talabalar shaharchasida arzon 1 xonali' },
    { type: 'district', labelUz: 'Sergeli tumani', labelRu: 'Сергелийский район', labelEn: 'Sergeli district', query: 'Sergelida arzon 2 xonali uy' },
    { type: 'metro', labelUz: 'Novza metrosi atrofida', labelRu: 'Возле метро Новза', labelEn: 'Near Novza metro', query: 'Novza metrosiga yaqin 2 xonali' },
    { type: 'metro', labelUz: 'Oybek metrosi atrofida', labelRu: 'Возле метро Ойбек', labelEn: 'Near Oybek metro', query: 'Oybek metrosi yaqinida 3 xonali' },
    { type: 'metro', labelUz: 'Bodomzor va Minor metrosi', labelRu: 'Возле метро Бодомзар и Минор', labelEn: 'Near Bodomzor metro', query: 'Bodomzor metrosi yaqinida 2 xonali' },
    { type: 'landmark', labelUz: 'Transport Universiteti (ToshIIT) va Vokzal', labelRu: 'Транспортный Университет (ТашИИТ)', labelEn: 'Transport University (ToshIIT)', query: 'Transport Universiteti yonida 2 xonali kvartira' },
    { type: 'landmark', labelUz: 'Tashkent City (Boulevard / Nest One)', labelRu: 'Tashkent City (Бульвар)', labelEn: 'Tashkent City (Boulevard)', query: 'Tashkent City da hashamatli 2 xonali' },
    { type: 'landmark', labelUz: 'TATU va INHA universiteti', labelRu: 'Университеты ТАТУ и ИНХА', labelEn: 'TUIT and INHA universities', query: 'TATU va INHA yaqinida 2 xonali' },
    { type: 'landmark', labelUz: 'Chorsu bozori va Samarqand Darvoza', labelRu: 'Рынок Чорсу', labelEn: 'Chorsu Market', query: 'Chorsu yaqinida 2 xonali' },
    { type: 'filter', labelUz: '1 xonali arzon uylar (talabalar / yoshlar)', labelRu: '1-комнатные недорогие', labelEn: '1-room affordable apartments', query: '1 xonali arzon kvartira' },
    { type: 'filter', labelUz: 'Hovli uy sotiladi (katta oilalar uchun)', labelRu: 'Продажа частного дома', labelEn: 'Private house for sale', query: '4 xonali hovli uy sotiladi' }
  ];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    setIsSearching(true);
    setIsLoadingProperties(true);

    try {
      const res = await apiClient.parseAndSearchWithAi(searchQuery);
      setLastParsedAiIntent(res.parsedIntent);
      setProperties(res.properties);

      if (res.parsedIntent.centerLat && res.parsedIntent.centerLng) {
        setMapSelection(
          { lat: res.parsedIntent.centerLat, lng: res.parsedIntent.centerLng },
          res.parsedIntent.radiusMeters || 2500
        );
      }

      showToast(
        language === 'en'
          ? `AI: Found ${res.properties.length} matching properties!`
          : language === 'ru'
          ? `AI: Найдено ${res.properties.length} объявлений!`
          : `AI: ${res.properties.length} ta mos e'lon topildi!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(
        language === 'en'
          ? "An error occurred during search"
          : language === 'ru'
          ? "Ошибка при поиске"
          : "Qidiruvda xatolik yuz berdi",
        'error'
      );
    } finally {
      setIsSearching(false);
      setIsLoadingProperties(false);
    }
  };

  // Filter dynamic suggestions matching current user typing
  const matchingSuggestions = suggestionItems.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.labelUz.toLowerCase().includes(q) ||
      item.labelRu.toLowerCase().includes(q) ||
      item.labelEn.toLowerCase().includes(q) ||
      item.query.toLowerCase().includes(q)
    );
  }).slice(0, 7);

  return (
    <div className="bg-gradient-to-b from-white via-slate-50/80 to-slate-100/90 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto text-center">
        {/* Compact, Punchy Hero Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-1.5">
          {language === 'en' ? 'Find your dream home with ' : language === 'ru' ? 'Найдите идеальное жилье с ' : 'Orzuingizdagi uyni '}
          <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-emerald-600 dark:from-brand-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
            {language === 'en'
              ? 'UyTop AI in 1 second'
              : language === 'ru'
              ? 'UyTop AI за 1 секунду'
              : "UyTop AI bilan 1 soniyada toping"}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mb-4">
          {language === 'en'
            ? 'Type naturally in the search box, or pick any instant discovery button below.'
            : language === 'ru'
            ? 'Напишите запрос в строке поиска или нажмите любую готовую кнопку ниже.'
            : "Qidiruv maydoniga yozing yoki tayyor tugmalardan birini bosing."}
        </p>

        {/* Search Box with Auto-Complete Dropdown */}
        <div ref={searchContainerRef} className="relative max-w-2xl mx-auto mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
          >
            <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-floating border-2 border-brand-500/30 hover:border-brand-500 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 p-1.5 sm:p-2 transition-all">
              <div className="pl-3 pr-2 text-brand-600 dark:text-brand-400 flex-shrink-0">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-brand-600 dark:text-brand-400" />
                ) : (
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400" />
                )}
              </div>

              <input
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder={
                  language === 'en'
                    ? 'Search (e.g. 2-room in Novza, student flat near TATU...)'
                    : language === 'ru'
                    ? 'Поиск (например: 2-комнатная на Новзе, возле ТАТУ...)'
                    : 'Masalan: Novzada 2 xonali, TATU yaqinida arzon uy...'
                }
                className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-xs sm:text-sm font-medium py-1.5 sm:py-2"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Submit Button */}
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:scale-98 disabled:opacity-50 text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? (language === 'en' ? 'Searching...' : language === 'ru' ? 'Поиск...' : "Qidirilmoqda...") : t.aiButton}</span>
              </button>
            </div>
          </form>

          {/* Interactive Live Auto-Suggest Dropdown */}
          {showSuggestions && matchingSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-left animate-fadeIn overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span>{language === 'en' ? 'Suggested locations & searches' : language === 'ru' ? 'Рекомендованные локации и запросы' : "Tavsiya qilingan hududlar va so'rovlar"}</span>
                <span className="text-[9px] lowercase font-normal text-slate-400">{matchingSuggestions.length} items</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {matchingSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(item.query);
                      handleSearch(item.query);
                    }}
                    className="w-full px-3.5 py-2.5 hover:bg-brand-50 dark:hover:bg-slate-700/80 flex items-center justify-between transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.type === 'metro' ? (
                        <Train className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : item.type === 'landmark' ? (
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      ) : item.type === 'filter' ? (
                        <Zap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-300 truncate">
                        {language === 'en' ? item.labelEn : language === 'ru' ? item.labelRu : item.labelUz}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Fast Category Discovery Cards */}
        <div className="mb-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-2 px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              {language === 'en' ? 'Instant 1-Click Discovery' : language === 'ru' ? 'Быстрый подбор в 1 клик' : '1-bosishda tezkor topish:'}
            </span>

            {/* AI Home Finder Assistant CTA */}
            <button
              type="button"
              onClick={() => setIsAiHomeFinderOpen(true)}
              className="text-[11px] font-extrabold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 hover:underline active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{language === 'en' ? '15s Quiz Assistant' : language === 'ru' ? 'AI Помощник 15 сек' : "15-soniyalik AI Yordamchi"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
            {discoveryPresets.map((preset) => {
              const Icon = preset.icon;
              const presetQuery = language === 'en' ? preset.queryEn : language === 'ru' ? preset.queryRu : preset.queryUz;
              const presetLabel = language === 'en' ? preset.labelEn : language === 'ru' ? preset.labelRu : preset.labelUz;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setQuery(presetQuery);
                    handleSearch(presetQuery);
                  }}
                  className="group relative flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800/90 hover:bg-brand-50/80 dark:hover:bg-slate-700 rounded-2xl border border-slate-200/90 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 transition-all shadow-2xs hover:shadow-sm active:scale-95 text-left"
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${preset.color} text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300 truncate">
                      {presetLabel}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {language === 'en' ? 'Instant view →' : language === 'ru' ? 'Открыть →' : "Ko'rish →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time AI Extracted Intent Context Card with Speaker Audio Button */}
        {lastParsedAiIntent && (
          <div className="mt-4 p-3 bg-brand-50/90 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 rounded-2xl max-w-2xl mx-auto text-left animate-fadeIn shadow-subtle">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs text-brand-950 dark:text-brand-200 leading-relaxed font-medium">
                    <span className="font-bold text-brand-700 dark:text-brand-400">
                      {language === 'en' ? 'AI Analysis: ' : language === 'ru' ? 'AI Анализ: ' : 'AI Tahlili: '}
                    </span>
                    <span>
                      {language === 'en'
                        ? (lastParsedAiIntent.explanationEn || lastParsedAiIntent.explanationUz)
                        : language === 'ru'
                        ? lastParsedAiIntent.explanationRu
                        : lastParsedAiIntent.explanationUz}
                    </span>
                  </div>
                </div>

                {/* Parsed Intent Entity Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(lastParsedAiIntent as any).landmarkName && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                      <GraduationCap className="w-3 h-3 text-brand-600" />
                      {(lastParsedAiIntent as any).landmarkName}
                    </span>
                  )}
                  {lastParsedAiIntent.district && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                      <MapPin className="w-3 h-3 text-brand-600" />
                      {lastParsedAiIntent.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}
                    </span>
                  )}
                  {lastParsedAiIntent.rooms && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                      <Home className="w-3 h-3 text-brand-600" />
                      {lastParsedAiIntent.rooms} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'}
                    </span>
                  )}
                  {lastParsedAiIntent.maxPrice && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                      💰 ≤ {(lastParsedAiIntent.maxPrice / 1000000).toLocaleString('uz-UZ')} {language === 'en' ? 'M UZS' : language === 'ru' ? 'млн сум' : "mln so'm"}
                    </span>
                  )}
                  {(lastParsedAiIntent.metroStationName || lastParsedAiIntent.nearMetro) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                      <Train className="w-3 h-3 text-brand-600" />
                      {lastParsedAiIntent.metroStationName
                        ? `${lastParsedAiIntent.metroStationName} ${language === 'en' ? 'metro' : language === 'ru' ? 'метро' : 'metrosi'}`
                        : (language === 'en' ? 'Near Metro' : language === 'ru' ? 'Рядом с метро' : 'Metro yaqinida')}
                    </span>
                  )}
                  {lastParsedAiIntent.confidenceScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-600 text-white text-[10px] font-extrabold ml-auto">
                      🎯 {language === 'en' ? 'Match:' : language === 'ru' ? 'Совпадение:' : 'Moslik:'} {Math.round(lastParsedAiIntent.confidenceScore * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

