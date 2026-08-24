'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Plus,
  Minus,
  Layers,
  Maximize2,
  Minimize2,
  Train,
  Crosshair,
  RotateCcw,
  Sparkles,
  Search,
  Eye,
  Check
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  TASHKENT_DISTRICTS,
  TASHKENT_METRO_STATIONS,
  MetroStation,
  TashkentDistrict
} from '@uytop/shared-types';
import { formatPriceUzs } from '../../lib/utils/formatters';

declare global {
  interface Window {
    L?: any;
  }
}

export const YandexMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const metroLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const initCalledRef = useRef(false);

  const {
    properties,
    activePropertyId,
    setActivePropertyId,
    selectedMapCenter,
    selectedRadiusMeters,
    setMapSelection,
    filters,
    setFilters,
    language
  } = useAppStore();

  const [isMapReady, setIsMapReady] = useState(false);
  const [mapType, setMapType] = useState<'street' | 'satellite' | 'dark'>('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [showMetroStations, setShowMetroStations] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [hasMovedSinceLastSearch, setHasMovedSinceLastSearch] = useState(false);
  const [autoSearchOnMove, setAutoSearchOnMove] = useState(false);

  const formatShortPrice = (priceUzs: number) => {
    if (priceUzs >= 1000000000) return `${(priceUzs / 1000000000).toFixed(1)} mlrd`;
    if (priceUzs >= 1000000) return `${(priceUzs / 1000000).toFixed(1)} mln`;
    return `${Math.round(priceUzs / 1000)}k`;
  };

  const getMetroLineColor = (line: string) => {
    switch (line) {
      case 'Chilonzor':
        return '#dc2626'; // Red
      case "O'zbekiston":
        return '#2563eb'; // Blue
      case 'Yunusobod':
        return '#059669'; // Green
      default:
        return '#7c3aed'; // Purple (Yerusti)
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initCalledRef.current) return;

    const initLeafletMap = () => {
      if (!window.L || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      initCalledRef.current = true;
      const L = window.L;

      const defaultCenter = selectedMapCenter
        ? [selectedMapCenter.lat, selectedMapCenter.lng]
        : [41.311087, 69.279737];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      const streetTiles = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
      tileLayerRef.current = streetTiles;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      const metroLayer = L.layerGroup();
      metroLayerRef.current = metroLayer;

      mapInstanceRef.current = map;

      // Handle map movements
      map.on('moveend', () => {
        setHasMovedSinceLastSearch(true);
      });

      // Fix size on mount
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 150);
    };

    if (window.L) {
      initLeafletMap();
    } else {
      const scriptId = 'leaflet-js';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => initLeafletMap();
        document.head.appendChild(script);
      } else {
        const timer = setInterval(() => {
          if (window.L) {
            clearInterval(timer);
            initLeafletMap();
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
        initCalledRef.current = false;
      }
    };
  }, []);

  // Map Click Handler for Pin Mode & Deselect
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: any) => {
      // If user clicked on a marker, Leaflet stops propagation, so this is blank area
      if (isPinModeActive) {
        setMapSelection({ lat: e.latlng.lat, lng: e.latlng.lng }, selectedRadiusMeters || 2000);
        setIsPinModeActive(false);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isMapReady, isPinModeActive, selectedRadiusMeters, setMapSelection]);

  // Sync Property Markers
  useEffect(() => {
    if (!isMapReady || !markersLayerRef.current || !window.L) return;

    const L = window.L;
    markersLayerRef.current.clearLayers();

    properties.forEach((property) => {
      const isSelected = activePropertyId === property.id;
      const priceText = formatShortPrice(property.priceUzs);

      const icon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div class="map-price-badge ${isSelected ? 'active' : ''}">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;"></span>
          <span>${priceText}</span>
        </div>`,
        iconSize: [85, 32],
        iconAnchor: [42, 16]
      });

      const marker = L.marker([property.latitude, property.longitude], { icon });

      const coverImg = property.images && property.images.length > 0
        ? property.images[0].thumbnailUrl || property.images[0].originalUrl
        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

      const propTitle = language === 'en' ? (property.titleEn || property.titleUz) : language === 'ru' ? (property.titleRu || property.titleUz) : property.titleUz;
      const roomLabel = language === 'en' ? 'rooms' : language === 'ru' ? 'комн.' : 'xona';
      const districtLabel = language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani';
      const viewDetailsLabel = language === 'en' ? 'View Details' : language === 'ru' ? 'Подробнее' : "Batafsil ko'rish";

      const popupHtml = `
        <div style="font-family:inherit;padding:2px;min-width:210px">
          <div style="width:100%;height:110px;border-radius:10px;overflow:hidden;margin-bottom:8px;position:relative;background:#f1f5f9">
            <img src="${coverImg}" style="width:100%;height:100%;object-fit:cover" alt="${propTitle}" />
            <div style="position:absolute;bottom:4px;right:4px;background:rgba(15,23,42,0.8);color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px">
              ${property.rooms} ${roomLabel} • ${property.areaSqm}m²
            </div>
          </div>
          <div style="font-size:14px;font-weight:800;color:#059669;margin-bottom:2px">
            ${formatPriceUzs(property.priceUzs)}
          </div>
          <div style="font-size:12px;font-weight:700;color:#0f172a;line-height:1.3;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
            ${propTitle}
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:8px">
            📍 ${property.district} ${districtLabel}, ${property.addressLine}
          </div>
          <button id="view-prop-btn-${property.id}" style="width:100%;background:#059669;color:#fff;font-weight:700;font-size:11px;padding:7px 0;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px">
            ${viewDetailsLabel}
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        closeButton: false,
        offset: [0, -10]
      });

      marker.on('click', () => {
        setActivePropertyId(property.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-prop-btn-${property.id}`);
        if (btn) {
          btn.onclick = () => {
            setActivePropertyId(property.id);
          };
        }
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [isMapReady, properties, activePropertyId, setActivePropertyId]);

  // Sync Metro Stations Layer
  useEffect(() => {
    if (!isMapReady || !metroLayerRef.current || !window.L || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const layer = metroLayerRef.current;

    layer.clearLayers();

    if (showMetroStations) {
      TASHKENT_METRO_STATIONS.forEach((station) => {
        const lineColor = getMetroLineColor(station.line);

        const metroIcon = L.divIcon({
          className: 'custom-metro-icon',
          html: `
            <div style="display:flex;align-items:center;gap:4px;background:#ffffff;padding:3px 8px;border-radius:20px;box-shadow:0 3px 10px rgba(0,0,0,0.18);border:1.5px solid ${lineColor};cursor:pointer;white-space:nowrap;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:${lineColor};color:#fff;border-radius:50%;font-size:9px;font-weight:900">M</span>
              <span style="font-size:11px;font-weight:700;color:#1e293b">${station.nameUz}</span>
            </div>
          `,
          iconSize: [120, 26],
          iconAnchor: [60, 13]
        });

        const marker = L.marker([station.lat, station.lng], { icon: metroIcon });

        marker.bindPopup(`
          <div style="font-family:inherit;font-size:12px;padding:4px">
            <div style="display:flex;items-center;gap:6px;margin-bottom:4px">
              <span style="background:${lineColor};color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700">${station.line} yo'li</span>
            </div>
            <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:6px">
              🚇 ${station.nameUz} bekati
            </div>
            <button id="filter-metro-${station.id}" style="width:100%;background:#059669;color:#fff;padding:5px 8px;border-radius:6px;border:none;font-weight:700;font-size:11px;cursor:pointer">
              Ushbu metro atrofidan qidirish (1.5 km)
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`filter-metro-${station.id}`);
          if (btn) {
            btn.onclick = () => {
              setMapSelection({ lat: station.lat, lng: station.lng }, 1500);
              map.closePopup();
            };
          }
        });

        layer.addLayer(marker);
      });

      if (!map.hasLayer(layer)) {
        layer.addTo(map);
      }
    } else {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    }
  }, [isMapReady, showMetroStations, setMapSelection]);

  // Sync Draggable Radius Center Marker & Circle
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Remove existing circle and center marker
    if (circleInstanceRef.current) {
      map.removeLayer(circleInstanceRef.current);
      circleInstanceRef.current = null;
    }
    if (centerMarkerRef.current) {
      map.removeLayer(centerMarkerRef.current);
      centerMarkerRef.current = null;
    }

    if (selectedMapCenter) {
      // 1. Draw Radius Circle
      const circle = L.circle([selectedMapCenter.lat, selectedMapCenter.lng], {
        radius: selectedRadiusMeters,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.14,
        weight: 2,
        dashArray: '6, 6'
      }).addTo(map);
      circleInstanceRef.current = circle;

      // 2. Center Draggable Pin
      const centerIcon = L.divIcon({
        className: 'custom-center-pin',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);cursor:grab">
            <div style="position:relative;width:36px;height:36px;background:#059669;color:white;border-radius:50%;box-shadow:0 8px 24px rgba(5,150,105,0.45);display:flex;align-items:center;justify-content:center;border:2.5px solid white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid #059669;margin-top:-1px"></div>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44]
      });

      const centerMarker = L.marker([selectedMapCenter.lat, selectedMapCenter.lng], {
        icon: centerIcon,
        draggable: true,
        zIndexOffset: 1000
      }).addTo(map);

      // Live dragging update
      centerMarker.on('drag', (e: any) => {
        const pos = e.target.getLatLng();
        if (circleInstanceRef.current) {
          circleInstanceRef.current.setLatLng(pos);
        }
      });

      centerMarker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        setMapSelection({ lat: pos.lat, lng: pos.lng }, selectedRadiusMeters);
      });

      centerMarkerRef.current = centerMarker;
    }
  }, [isMapReady, selectedMapCenter, selectedRadiusMeters, setMapSelection]);

  // Controls Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleLocateMe = () => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapInstanceRef.current?.flyTo([latitude, longitude], 15, { duration: 0.65, easeLinearity: 0.3 });
          setMapSelection({ lat: latitude, lng: longitude }, selectedRadiusMeters || 2000);
        },
        () => {
          alert("Joylashuvingizni aniqlashga ruxsat berilmadi.");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const dist = TASHKENT_DISTRICTS.find((d) => d.nameUz === districtName);
    if (dist && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([dist.lat, dist.lng], 14, { duration: 0.65, easeLinearity: 0.3 });
      setFilters({ district: districtName });
    } else if (!districtName) {
      setFilters({ district: undefined });
    }
  };

  const handleSearchCurrentViewport = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const center = map.getCenter();
    const bounds = map.getBounds();
    const northEast = bounds.getNorthEast();

    // Approximate radius from center to corner
    const radiusMeters = Math.min(
      10000,
      Math.max(500, Math.round(center.distanceTo(northEast)))
    );

    setMapSelection({ lat: center.lat, lng: center.lng }, radiusMeters);
    setHasMovedSinceLastSearch(false);
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
    } else if (mapType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(mapInstanceRef.current);
      setMapType('dark');
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(mapInstanceRef.current);
      setMapType('street');
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  return (
    <div
      className={`relative w-full h-full bg-slate-100 overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 !h-screen !w-screen' : ''
      } ${isPinModeActive ? 'cursor-crosshair' : ''}`}
    >
      {/* Actual Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Mode Banner when Pin Mode is Active */}
      {isPinModeActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-emerald-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Crosshair className="w-4 h-4 animate-spin" />
          <span>Xaritada qidirmoqchi bo'lgan nuqtangizni bosing</span>
          <button
            onClick={() => setIsPinModeActive(false)}
            className="ml-2 bg-emerald-800 hover:bg-emerald-900 px-2 py-0.5 rounded-full text-[10px]"
          >
            Bekor qilish
          </button>
        </div>
      )}

      {/* Floating 'Search In This Area' button when map is moved */}
      {hasMovedSinceLastSearch && !selectedMapCenter && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-fadeIn">
          <button
            onClick={handleSearchCurrentViewport}
            className="flex items-center gap-2 bg-white/95 hover:bg-white text-slate-900 px-4 py-2 rounded-full shadow-xl border border-slate-200 text-xs font-bold hover:text-emerald-700 transition-all active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === 'en'
                ? 'Search this area'
                : language === 'ru'
                ? 'Искать в этой области'
                : 'Ushbu hududda qidirish'}
            </span>
          </button>
        </div>
      )}

      {/* Top-Left Control Panel: District Quick Jump & Radius Toolbar */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 max-w-[280px] sm:max-w-xs">
        {/* District Selector Pill */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/90 p-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600 ml-1 flex-shrink-0" />
          <select
            value={filters.district || selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-800 border-none focus:outline-none cursor-pointer py-1 pr-1 truncate"
          >
            <option value="">
              {language === 'en' ? 'All Tashkent districts' : language === 'ru' ? 'Все районы Ташкента' : 'Barcha Toshkent tumanlari'}
            </option>
            {TASHKENT_DISTRICTS.map((d) => (
              <option key={d.id} value={d.nameUz}>
                {language === 'en' ? (d.nameEn || d.nameUz) : language === 'ru' ? d.nameRu : d.nameUz} {language === 'en' ? 'district' : language === 'ru' ? 'район' : 'tumani'}
              </option>
            ))}
          </select>
        </div>

        {/* Accessibility & Radius Search Panel */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-2.5 flex flex-col gap-2">
          {/* Mode Switcher: Radius vs Walking Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setFilters({ searchMode: 'RADIUS' })}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  filters.searchMode !== 'WALKING_TIME'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ⭕ {language === 'en' ? 'Radius' : language === 'ru' ? 'Радиус' : 'Radius'}
              </button>
              <button
                type="button"
                onClick={() => setFilters({ searchMode: 'WALKING_TIME', travelMinutes: filters.travelMinutes || 10 })}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  filters.searchMode === 'WALKING_TIME'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🚶 {language === 'en' ? 'Walking' : language === 'ru' ? 'Пешком' : 'Piyoda'}
              </button>
            </div>

            {/* Toggle Pin/Click mode */}
            <button
              onClick={() => setIsPinModeActive(!isPinModeActive)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                isPinModeActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              title={language === 'en' ? 'Select center on map' : language === 'ru' ? 'Выбрать центр на карте' : 'Xaritadan markazni tanlash'}
            >
              {isPinModeActive
                ? (language === 'en' ? 'Selecting...' : language === 'ru' ? 'Выбор...' : 'Tanlanmoqda...')
                : (language === 'en' ? 'Set Center' : language === 'ru' ? 'Центр' : 'Markaz tanlash')}
            </button>
          </div>

          {/* Walking Time Presets when Piyoda is selected */}
          {filters.searchMode === 'WALKING_TIME' ? (
            <div className="grid grid-cols-4 gap-1 bg-emerald-50/70 border border-emerald-200/60 p-1 rounded-xl">
              {[
                { label: language === 'en' ? '5 min' : language === 'ru' ? '5 мин' : '5 daq', value: 5 },
                { label: language === 'en' ? '10 min' : language === 'ru' ? '10 мин' : '10 daq', value: 10 },
                { label: language === 'en' ? '15 min' : language === 'ru' ? '15 мин' : '15 daq', value: 15 },
                { label: language === 'en' ? '20 min' : language === 'ru' ? '20 мин' : '20 daq', value: 20 },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => {
                    const center =
                      selectedMapCenter ||
                      (mapInstanceRef.current
                        ? {
                            lat: mapInstanceRef.current.getCenter().lat,
                            lng: mapInstanceRef.current.getCenter().lng,
                          }
                        : { lat: 41.311087, lng: 69.279737 });
                    setMapSelection(center, Math.round(m.value * 80 * 1.3));
                    setFilters({
                      searchMode: 'WALKING_TIME',
                      travelMinutes: m.value,
                      originLat: center.lat,
                      originLng: center.lng,
                    });
                    setHasMovedSinceLastSearch(false);
                  }}
                  className={`py-1 text-xs font-extrabold rounded-lg transition-all text-center ${
                    filters.travelMinutes === m.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-800 hover:bg-emerald-200/60'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          ) : (
            /* Standard Radius Presets */
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { label: '500m', value: 500 },
                { label: '1km', value: 1000 },
                { label: '2km', value: 2000 },
                { label: '5km', value: 5000 },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    const center =
                      selectedMapCenter ||
                      (mapInstanceRef.current
                        ? {
                            lat: mapInstanceRef.current.getCenter().lat,
                            lng: mapInstanceRef.current.getCenter().lng,
                          }
                        : { lat: 41.311087, lng: 69.279737 });
                    setMapSelection(center, r.value);
                    setFilters({ searchMode: 'RADIUS', travelMinutes: undefined });
                    setHasMovedSinceLastSearch(false);
                  }}
                  className={`py-1 text-xs font-bold rounded-lg transition-all text-center ${
                    selectedRadiusMeters === r.value && selectedMapCenter && filters.searchMode !== 'WALKING_TIME'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Draggable indicator & Reset button */}
          {selectedMapCenter ? (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {filters.searchMode === 'WALKING_TIME'
                    ? (language === 'en' ? `${filters.travelMinutes || 10} min walk` : language === 'ru' ? `${filters.travelMinutes || 10} мин пешком` : `Piyoda ${filters.travelMinutes || 10} daqiqa`)
                    : (language === 'en' ? `${selectedRadiusMeters}m circle` : language === 'ru' ? `${selectedRadiusMeters}м круг` : `${selectedRadiusMeters}m doira`)}
                </span>
              </span>
              <button
                onClick={() => {
                  setMapSelection(null);
                  setFilters({ travelMinutes: undefined, searchMode: 'RADIUS' });
                  setHasMovedSinceLastSearch(false);
                }}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline"
              >
                {language === 'en' ? 'Reset' : language === 'ru' ? 'Сбросить' : 'Bekor qilish'}
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium text-center">
              {language === 'en'
                ? 'Click button to choose search center'
                : language === 'ru'
                ? 'Нажмите кнопку, чтобы задать центр'
                : 'Markazni belgilash uchun tugmani bosing'}
            </span>
          )}
        </div>
      </div>

      {/* Top-Right Navigation & Layer Tools */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden flex flex-col">
          <button
            onClick={handleZoomIn}
            className="p-2.5 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 border-b border-slate-100 transition-colors"
            title={language === 'en' ? 'Zoom in (+)' : language === 'ru' ? 'Приблизить (+)' : 'Kattalashtirish (+)'}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
            title={language === 'en' ? 'Zoom out (-)' : language === 'ru' ? 'Отдалить (-)' : 'Kichiklashtirish (-)'}
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Locate Me */}
        <button
          onClick={handleLocateMe}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-all active:scale-95"
          title={language === 'en' ? 'My location (GPS)' : language === 'ru' ? 'Мое местоположение (GPS)' : 'Mening joylashuvim (GPS)'}
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Metro Stations Layer Toggle */}
        <button
          onClick={() => setShowMetroStations(!showMetroStations)}
          className={`p-2.5 rounded-2xl shadow-lg border transition-all active:scale-95 ${
            showMetroStations
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-700 hover:text-emerald-600 hover:bg-slate-100'
          }`}
          title={language === 'en' ? 'Show Metro Stations' : language === 'ru' ? 'Показать станции метро' : "Metro bekatlarini ko'rsatish"}
        >
          <Train className="w-4 h-4" />
        </button>

        {/* Layer Switcher (Street / Satellite / Dark) */}
        <button
          onClick={handleToggleLayer}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-all active:scale-95"
          title={language === 'en' ? `Map style: ${mapType.toUpperCase()}` : language === 'ru' ? `Стиль карты: ${mapType.toUpperCase()}` : `Xarita turi: ${mapType.toUpperCase()}`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-all active:scale-95"
          title={isFullscreen ? (language === 'en' ? 'Exit fullscreen' : language === 'ru' ? 'Свернуть' : 'Kichraytirish') : (language === 'en' ? 'Fullscreen' : language === 'ru' ? 'Во весь экран' : 'Butun ekran')}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Floating Stats Pill */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>
          {language === 'en' ? 'On map: ' : language === 'ru' ? 'На карте: ' : 'Xaritada: '}
          <b>{properties.length}</b> {language === 'en' ? 'properties' : language === 'ru' ? 'объектов' : 'ta mulk'}
        </span>
      </div>
    </div>
  );
};
