'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Plus, Minus, Layers } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TashkentDistrict, TASHKENT_DISTRICTS, TASHKENT_METRO_STATIONS } from '@uytop/shared-types';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  district?: string;
  onLocationChange: (lat: number, lng: number, detectedDistrict?: string) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  district,
  onLocationChange,
}) => {
  const { language } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');

  // Find nearest district
  const findClosestDistrict = (lat: number, lng: number): TashkentDistrict | undefined => {
    let closest: TashkentDistrict | undefined;
    let minDistance = Infinity;

    for (const d of TASHKENT_DISTRICTS) {
      const dist = Math.sqrt(Math.pow(d.lat - lat, 2) + Math.pow(d.lng - lng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closest = d;
      }
    }
    return closest;
  };

  // Find nearest metro
  const getNearestMetro = (lat: number, lng: number) => {
    let closest = TASHKENT_METRO_STATIONS[0];
    let minD = Infinity;
    for (const m of TASHKENT_METRO_STATIONS) {
      const d = Math.sqrt(Math.pow(m.lat - lat, 2) + Math.pow(m.lng - lng, 2));
      if (d < minD) {
        minD = d;
        closest = m;
      }
    }
    const approxMeters = Math.round(minD * 111000);
    return { ...closest, distanceMeters: approxMeters };
  };

  const nearestMetro = getNearestMetro(latitude, longitude);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = () => {
      if (!window.L || !mapContainerRef.current || mapInstanceRef.current) return;
      const L = window.L;

      const map = L.map(mapContainerRef.current, {
        center: [latitude || 41.311087, longitude || 69.279737],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      const streetTiles = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
      tileLayerRef.current = streetTiles;

      // Custom draggable pin icon
      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="transform: translate(-50%, -100%); cursor: grab; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 38px; height: 38px; background: #059669; color: white; border-radius: 50%; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.4); display: flex; align-items: center; justify-content: center; border: 2.5px solid white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #059669; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      });

      const marker = L.marker([latitude || 41.311087, longitude || 69.279737], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        const detected = findClosestDistrict(pos.lat, pos.lng);
        onLocationChange(pos.lat, pos.lng, detected?.nameUz);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        const detected = findClosestDistrict(e.latlng.lat, e.latlng.lng);
        onLocationChange(e.latlng.lat, e.latlng.lng, detected?.nameUz);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 150);
    };

    if (window.L) {
      initMap();
    } else {
      const scriptId = 'leaflet-js';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        const timer = setInterval(() => {
          if (window.L) {
            clearInterval(timer);
            initMap();
          }
        }, 150);
        return () => clearInterval(timer);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if props change externally
  useEffect(() => {
    if (isMapReady && markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude, isMapReady]);

  const handleLocateMe = () => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 16);
          const detected = findClosestDistrict(lat, lng);
          onLocationChange(lat, lng, detected?.nameUz);
        }
      });
    }
  };

  const handleToggleLayer = () => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    if (mapType === 'street') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(mapInstanceRef.current);
      setMapType('satellite');
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(mapInstanceRef.current);
      setMapType('street');
    }
  };

  const metroName = language === 'en' ? (nearestMetro.nameEn || nearestMetro.nameUz) : language === 'ru' ? nearestMetro.nameRu : nearestMetro.nameUz;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <MapPin className="w-4 h-4 text-emerald-600" />
          {language === 'en'
            ? 'Click point on map or drag marker'
            : language === 'ru'
            ? 'Кликните на карте или перетащите метку'
            : 'Xaritadan aniq nuqtani bosing yoki pinni suring'}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </span>
      </div>

      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Controls */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="p-2 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 border-b border-slate-100 transition-colors"
              title={language === 'en' ? 'Zoom in' : language === 'ru' ? 'Приблизить' : 'Kattalashtirish'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="p-2 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
              title={language === 'en' ? 'Zoom out' : language === 'ru' ? 'Отдалить' : 'Kichiklashtirish'}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleLocateMe}
            className="p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
            title={language === 'en' ? 'My location' : language === 'ru' ? 'Мое местоположение' : 'Mening hozirgi joylashuvim'}
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleToggleLayer}
            className="p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
            title={language === 'en' ? 'Satellite / Street view' : language === 'ru' ? 'Спутник / Карта' : 'Sputnik / Xarita'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl p-2 px-3 shadow-md border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-900 truncate">
              {district ? `${district} ${language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}` : (language === 'en' ? 'Tashkent' : language === 'ru' ? 'Ташкент' : 'Toshkent')}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 truncate">
              🚇 {metroName} ({nearestMetro.distanceMeters}m)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
            {language === 'en' ? 'Draggable pin' : language === 'ru' ? 'Перетаскиваемый пин' : 'Pinni surish mumkin'}
          </span>
        </div>
      </div>
    </div>
  );
};
