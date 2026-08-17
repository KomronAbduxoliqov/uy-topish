import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight, CheckCircle2, SlidersHorizontal, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n';
import { apiClient } from '../../api/client';

export const AiSearchHero: React.FC = () => {
  const {
    language,
    setProperties,
    setIsLoadingProperties,
    setLastParsedAiIntent,
    lastParsedAiIntent,
    setFilters
  } = useAppStore();

  const t = translations[language];
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const samplePrompts = [
    "Chilonzorda 4 mln gacha 2 xonali mebelli kvartira",
    "Novza metrosi yaqinidan 3 xonali uy",
    "Yunusobodda arzon 1 xonali kvartira",
    "Oybek metrosida hashamatli 3 xonali (sotiladi)",
    "Shota Rustavelida kunlik 2 xonali"
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setIsLoadingProperties(true);

    try {
      const res = await apiClient.parseAndSearchWithAi(searchQuery);
      setLastParsedAiIntent(res.parsedIntent);
      setProperties(res.properties);

      // Also sync structured filters
      if (res.parsedIntent.district) {
        setFilters({ district: res.parsedIntent.district });
      }
      if (res.parsedIntent.transactionType) {
        setFilters({ transactionType: res.parsedIntent.transactionType });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
      setIsLoadingProperties(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          {t.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6">
          {t.heroSubtitle}
        </p>

        {/* AI Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative max-w-3xl mx-auto mb-4"
        >
          <div className="relative flex items-center bg-white rounded-2xl shadow-floating border-2 border-brand-500/30 hover:border-brand-500 transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 p-2">
            <div className="pl-3 pr-2 text-brand-600">
              <Sparkles className={`w-6 h-6 ${isSearching ? 'animate-spin' : ''}`} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.aiSearchPlaceholder}
              className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm sm:text-base font-medium py-2"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>{t.aiButton}</span>
            </button>
          </div>
        </form>

        {/* Sample Prompt Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1">Masalan:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                handleSearch(p);
              }}
              className="text-xs bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-medium px-3 py-1.5 rounded-full border border-slate-200 hover:border-brand-200 transition-all shadow-subtle flex items-center gap-1"
            >
              <span>{p}</span>
            </button>
          ))}
        </div>

        {/* Real-time AI Extracted Intent Preview */}
        {lastParsedAiIntent && (
          <div className="mt-4 p-3 bg-brand-50/80 border border-brand-200 rounded-xl text-left flex items-start gap-3 max-w-3xl mx-auto animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-brand-900 leading-relaxed">
              <span className="font-bold">{language === 'uz' ? 'AI Tahlili' : 'Анализ AI'}: </span>
              {language === 'uz' ? lastParsedAiIntent.explanationUz : lastParsedAiIntent.explanationRu}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
