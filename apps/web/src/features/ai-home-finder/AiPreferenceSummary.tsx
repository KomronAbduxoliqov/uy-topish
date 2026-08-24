'use client';

import React from 'react';
import {
  MapPin,
  Home,
  DollarSign,
  Train,
  Armchair,
  GraduationCap,
  Briefcase,
  X,
  Sparkles
} from 'lucide-react';
import { UserPreferenceModel } from '@uytop/shared-types';
import { useAppStore } from '../../store/useAppStore';
import { formatNumber } from '../../lib/utils/formatters';

interface Props {
  preferences: UserPreferenceModel;
  onClearField?: (field: keyof UserPreferenceModel) => void;
}

export const AiPreferenceSummary: React.FC<Props> = ({ preferences, onClearField }) => {
  const { language } = useAppStore();

  const hasAnyPref =
    preferences.district ||
    (preferences.rooms && preferences.rooms.length > 0) ||
    preferences.maxPrice ||
    preferences.nearMetro ||
    preferences.furnished ||
    preferences.nearSchool ||
    preferences.workLocation ||
    preferences.universityLocation;

  if (!hasAnyPref) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 mb-4 animate-fadeIn shadow-subtle">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>
            {language === 'en' ? 'Active Search Criteria:' : language === 'ru' ? 'Выбранные критерии:' : 'Tanlangan talablar:'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {/* District */}
        {preferences.district && (
          <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
            <MapPin className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            <span>
              {preferences.district} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}
            </span>
            {onClearField && (
              <button
                type="button"
                onClick={() => onClearField('district')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        )}

        {/* Rooms */}
        {preferences.rooms && preferences.rooms.length > 0 && (
          <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
            <Home className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            <span>
              {preferences.rooms.join(', ')} {language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xonali'}
            </span>
            {onClearField && (
              <button
                type="button"
                onClick={() => onClearField('rooms')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        )}

        {/* Max Price */}
        {preferences.maxPrice && (
          <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
            <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>≤ {formatNumber(preferences.maxPrice)} {language === 'en' ? 'UZS' : language === 'ru' ? 'сум' : "so'm"}</span>
            {onClearField && (
              <button
                type="button"
                onClick={() => onClearField('maxPrice')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        )}

        {/* Near Metro */}
        {preferences.nearMetro && (
          <span className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
            <Train className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            <span>{language === 'en' ? 'Near Metro' : language === 'ru' ? 'Рядом с метро' : 'Metro yaqinida'}</span>
            {onClearField && (
              <button
                type="button"
                onClick={() => onClearField('nearMetro')}
                className="text-brand-400 hover:text-brand-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        )}

        {/* Furnished */}
        {preferences.furnished && (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
            <Armchair className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{language === 'en' ? 'Furnished' : language === 'ru' ? 'С мебелью' : 'Mebelli'}</span>
            {onClearField && (
              <button
                type="button"
                onClick={() => onClearField('furnished')}
                className="text-amber-400 hover:text-amber-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        )}

        {/* Workplace */}
        {preferences.workLocation && (
          <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
            <Briefcase className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>{language === 'en' ? 'Work:' : language === 'ru' ? 'Работа:' : 'Ish:'} {preferences.workLocation.name}</span>
            {onClearField && (
              <button
                type="button"
                onClick={() => onClearField('workLocation')}
                className="text-indigo-400 hover:text-indigo-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        )}

        {/* University */}
        {preferences.universityLocation && (
          <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
            <GraduationCap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>{language === 'en' ? 'Study:' : language === 'ru' ? 'Учеба:' : "O'qish:"} {preferences.universityLocation.name}</span>
            {onClearField && (
              <button
                type="button"
                onClick={() => onClearField('universityLocation')}
                className="text-purple-400 hover:text-purple-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
};
