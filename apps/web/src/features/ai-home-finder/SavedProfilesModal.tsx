'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Bell,
  Trash2,
  ArrowRight,
  Sparkles,
  MapPin,
  Home,
  DollarSign
} from 'lucide-react';
import { SavedSearchProfile } from '@uytop/shared-types';
import { useAppStore } from '../../store/useAppStore';
import { apiClient } from '../../lib/api/client';
import { formatNumber } from '../../lib/utils/formatters';

export const SavedProfilesModal: React.FC = () => {
  const {
    isSavedProfilesOpen,
    setIsSavedProfilesOpen,
    setFilters,
    setIsAiHomeFinderOpen,
    setAiFinderPreferences,
    language
  } = useAppStore();

  const [profiles, setProfiles] = useState<SavedSearchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSavedProfilesOpen) {
      loadProfiles();
    }
  }, [isSavedProfilesOpen]);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const list = await apiClient.getSearchProfiles();
      setProfiles(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteSearchProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivate = (profile: SavedSearchProfile) => {
    setAiFinderPreferences(profile.preferences);
    if (profile.preferences.district) {
      setFilters({ district: profile.preferences.district });
    }
    if (profile.preferences.maxPrice) {
      setFilters({ maxPrice: profile.preferences.maxPrice });
    }
    setIsSavedProfilesOpen(false);
    setIsAiHomeFinderOpen(true);
  };

  if (!isSavedProfilesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {language === 'en' ? 'Saved Search Profiles' : language === 'ru' ? 'Сохраненные профили поиска' : 'Saqlangan qidiruv profillari'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {language === 'en' ? 'Your saved personal AI search criteria' : language === 'ru' ? 'Ваши персональные критерии поиска' : 'Siz saqlagan shaxsiy AI qidiruv mezonlari'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSavedProfilesOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {profiles.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'en' ? 'No saved profiles yet' : language === 'ru' ? 'Нет сохраненных профилей' : "Hozircha saqlangan profil yo'q"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                {language === 'en'
                  ? 'After running an AI search, you can save your search criteria profile here.'
                  : language === 'ru'
                  ? 'После поиска с AI вы можете сохранить критерии для быстрого доступа.'
                  : "AI yordamchisida qidiruv qilgandan so'ng, profilni saqlab qo'yishingiz mumkin."}
              </p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-brand-300 dark:hover:border-brand-500 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <span>{profile.name}</span>
                      {profile.isActiveAlert && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Bell className="w-2.5 h-2.5" />
                          {language === 'en' ? 'Active' : language === 'ru' ? 'Активен' : 'Faol'}
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(profile.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uz-UZ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(profile.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                      title={language === 'en' ? 'Delete' : language === 'ru' ? 'Удалить' : "O'chirish"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActivate(profile)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <span>{language === 'en' ? 'Search' : language === 'ru' ? 'Искать' : 'Qidirish'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Preference tags */}
                <div className="flex flex-wrap gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 pt-1">
                  {profile.preferences.district && (
                    <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      📍 {profile.preferences.district}
                    </span>
                  )}
                  {profile.preferences.rooms && (
                    <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      🏠 {profile.preferences.rooms.join(',')} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona'}
                    </span>
                  )}
                  {profile.preferences.maxPrice && (
                    <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      💰 ≤ {formatNumber(profile.preferences.maxPrice)} {language === 'en' ? 'UZS' : language === 'ru' ? 'сум' : "so'm"}
                    </span>
                  )}
                  {profile.preferences.nearMetro && (
                    <span className="bg-brand-50 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 px-2 py-0.5 rounded-md border border-brand-100 dark:border-brand-800">
                      🚇 {language === 'en' ? 'Near Metro' : language === 'ru' ? 'Рядом с метро' : 'Metro'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
