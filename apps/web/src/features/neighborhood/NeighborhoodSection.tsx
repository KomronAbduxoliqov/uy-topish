"use client";

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Hospital,
  ShoppingCart,
  TreePine,
  Train,
  MapPin,
  Activity,
  Map as MapIcon,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { useAppStore } from '../../store/useAppStore';

export interface NeighborhoodSectionProps {
  district: string;
  lat?: number;
  lng?: number;
}

interface NearbyItem {
  id: string;
  nameUz: string;
  nameRu?: string;
  nameEn?: string;
  category: string;
  walkingMinutes: number;
  routeDistanceMeters: number;
  straightLineMeters: number;
}

const CATEGORIES = [
  { id: 'transport', labelUz: 'Transport', labelRu: 'Транспорт', labelEn: 'Transport', icon: Train, color: 'text-brand-600', bgColor: 'bg-brand-50' },
  { id: 'education', labelUz: 'Ta\'lim', labelRu: 'Образование', labelEn: 'Education', icon: GraduationCap, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  { id: 'shopping', labelUz: 'Xarid', labelRu: 'Покупки', labelEn: 'Shopping', icon: ShoppingCart, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'healthcare', labelUz: 'Tibbiyot', labelRu: 'Медицина', labelEn: 'Healthcare', icon: Hospital, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'recreation', labelUz: 'Bog\'lar', labelRu: 'Парки', labelEn: 'Parks', icon: TreePine, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

export function NeighborhoodSection({ district, lat, lng }: NeighborhoodSectionProps) {
  const { language } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('transport');
  const [score, setScore] = useState<number>(88);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({
    transport: 92,
    education: 85,
    shopping: 94,
    healthcare: 82,
    recreation: 88,
  });
  const [poiItems, setPoiItems] = useState<NearbyItem[]>([
    { id: '1', nameUz: 'Novza metrosi', nameRu: 'Метро Новза', nameEn: 'Novza Metro Station', category: 'transport', walkingMinutes: 6, routeDistanceMeters: 480, straightLineMeters: 380 },
    { id: '2', nameUz: '178-sonli ixtisoslashgan maktab', nameRu: 'Специализированная школа №178', nameEn: 'Specialized School #178', category: 'education', walkingMinutes: 8, routeDistanceMeters: 620, straightLineMeters: 510 },
    { id: '3', nameUz: 'Smart Kids bolalar bog\'chasi', nameRu: 'Детский сад Smart Kids', nameEn: 'Smart Kids Kindergarten', category: 'education', walkingMinutes: 5, routeDistanceMeters: 400, straightLineMeters: 320 },
    { id: '4', nameUz: 'Korzinka — Qatortol', nameRu: 'Корзинка — Катартал', nameEn: 'Korzinka Supermarket — Qatortol', category: 'shopping', walkingMinutes: 4, routeDistanceMeters: 320, straightLineMeters: 260 },
    { id: '5', nameUz: 'Shox Med Center klinikasi', nameRu: 'Клиника Shox Med Center', nameEn: 'Shox Med Center Clinic', category: 'healthcare', walkingMinutes: 11, routeDistanceMeters: 890, straightLineMeters: 710 },
    { id: '6', nameUz: 'Magic City bog\'i', nameRu: 'Парк Magic City', nameEn: 'Magic City Park', category: 'recreation', walkingMinutes: 14, routeDistanceMeters: 1100, straightLineMeters: 900 },
  ]);

  useEffect(() => {
    if (lat && lng) {
      apiClient.getNearbyContext(lat, lng).then((res) => {
        if (res) {
          setScore(res.overallConvenienceScore);
          setCategoryScores(res.categoryScores);
          if (res.poiItems && res.poiItems.length > 0) {
            const mapped = res.poiItems.map((p: any) => ({
              id: p.id,
              nameUz: p.nameUz,
              nameRu: p.nameRu || p.nameUz,
              nameEn: p.nameEn || p.nameUz,
              category:
                p.category === 'metro'
                  ? 'transport'
                  : p.category === 'school' || p.category === 'kindergarten'
                  ? 'education'
                  : p.category === 'supermarket'
                  ? 'shopping'
                  : p.category === 'hospital'
                  ? 'healthcare'
                  : 'recreation',
              walkingMinutes: p.walkingMinutes,
              routeDistanceMeters: p.routeDistanceMeters,
              straightLineMeters: p.straightLineMeters,
            }));
            setPoiItems(mapped);
          }
        }
      });
    }
  }, [lat, lng]);

  const filteredPois = poiItems.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>
              {language === 'en'
                ? 'Smart Nearby & Convenience Index'
                : language === 'ru'
                ? 'Инфраструктура и Индекс удобства'
                : 'Smart Nearby & Qulaylik Indeksi'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'en'
              ? 'Real walking paths and city infrastructure distances'
              : language === 'ru'
              ? 'Реальные пешеходные маршруты и расстояния до объектов'
              : "Haqiqiy piyoda yo'l va shahar infratuzilmasi masofalari"}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-2xl">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            {score}/100 {language === 'en' ? 'Convenience' : language === 'ru' ? 'Удобство' : 'Qulaylik'}
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          const catScore = categoryScores[cat.id] || 85;
          const label = language === 'en' ? cat.labelEn : language === 'ru' ? cat.labelRu : cat.labelUz;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isSelected
                  ? 'bg-slate-900 dark:bg-brand-600 text-white border-slate-900 dark:border-brand-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />
              <span>{label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {catScore}
              </span>
            </button>
          );
        })}
      </div>

      {/* POI List */}
      <div className="space-y-2 pt-1">
        {filteredPois.length === 0 ? (
          <div className="text-xs text-slate-400 font-medium py-3 text-center bg-slate-50 dark:bg-slate-800 rounded-xl">
            {language === 'en'
              ? 'Nearest places in this category are located over 2.5 km away'
              : language === 'ru'
              ? 'Ближайшие объекты этой категории находятся дальше 2.5 км'
              : "Bu toifadagi eng yaqin joylar 2.5 km masofadan uzoqda joylashgan"}
          </div>
        ) : (
          filteredPois.map((item) => {
            const name = language === 'en' ? (item.nameEn || item.nameUz) : language === 'ru' ? (item.nameRu || item.nameUz) : item.nameUz;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs">
                    <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>
                        🚶 {item.walkingMinutes} {language === 'en' ? 'min walk' : language === 'ru' ? 'мин пешком' : 'daqiqa piyoda'}
                      </span>
                      <span>•</span>
                      <span>
                        📍 {item.routeDistanceMeters}{language === 'en' ? 'm walk route' : language === 'ru' ? 'м по маршруту' : "m yo'l"}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  {item.walkingMinutes} {language === 'en' ? 'min' : language === 'ru' ? 'мин' : 'daq'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

