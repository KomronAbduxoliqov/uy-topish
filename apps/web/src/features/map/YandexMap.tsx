import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Plus, Minus, Layers, Compass } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Property } from '@uytop/shared-types';

declare global {
  interface Window {
    ymaps?: any;
  }
}

export const YandexMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const {
    properties,
    activePropertyId,
    setActivePropertyId,
    selectedMapCenter,
    selectedRadiusMeters,
    setMapSelection,
    language
  } = useAppStore();

  const [isMapReady, setIsMapReady] = useState(false);
  const [mapType, setMapType] = useState<'map' | 'hybrid'>('map');

  // Format short price for map badges
  const formatShortPrice = (priceUzs: number) => {
    if (priceUzs >= 1000000000) {
      return `${(priceUzs / 1000000000).toFixed(1)} mlrd`;
    }
    if (priceUzs >= 1000000) {
      return `${(priceUzs / 1000000).toFixed(1)} mln`;
    }
    return `${Math.round(priceUzs / 1000)}k`;
  };

  // Initialize Yandex Map
  useEffect(() => {
    if (!window.ymaps) {
      // Fallback timer if script is loading
      const timer = setInterval(() => {
        if (window.ymaps) {
          clearInterval(timer);
          initMap();
        }
      }, 500);
      return () => clearInterval(timer);
    }

    initMap();

    function initMap() {
      window.ymaps.ready(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const defaultCenter = [41.311087, 69.279737]; // Tashkent center

        const map = new window.ymaps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 12,
          controls: [] // We render custom clean controls
        }, {
          suppressMapOpenBlock: true
        });

        // Click event on map: Set radius search center
        map.events.add('click', (e: any) => {
          const coords = e.get('coords');
          setMapSelection({ lat: coords[0], lng: coords[1] });
        });

        const markersGroup = new window.ymaps.GeoObjectCollection();
        map.geoObjects.add(markersGroup);
        markersGroupRef.current = markersGroup;

        mapInstanceRef.current = map;
        setIsMapReady(true);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markersGroupRef.current || !window.ymaps) return;

    markersGroupRef.current.removeAll();

    properties.forEach((property) => {
      const isSelected = activePropertyId === property.id;
      const priceFormatted = formatShortPrice(property.priceUzs);

      // Create Custom HTML Layout for Price Badge
      const CustomLayout = window.ymaps.templateLayoutFactory.createClass(
        `<div class="map-price-badge ${isSelected ? 'active' : ''}">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981;"></span>
          ${priceFormatted}
        </div>`
      );

      const placemark = new window.ymaps.Placemark(
        [property.latitude, property.longitude],
        {
          hintContent: property.titleUz,
          balloonContentHeader: property.titleUz,
          balloonContentBody: `<b>${property.priceUzs.toLocaleString('uz-UZ')} so'm</b><br>${property.addressLine}`,
          propertyId: property.id
        },
        {
          iconLayout: CustomLayout,
          iconOffset: [-25, -15],
          cursor: 'pointer'
        }
      );

      placemark.events.add('click', () => {
        setActivePropertyId(property.id);
      });

      markersGroupRef.current.add(placemark);
    });
  }, [isMapReady, properties, activePropertyId]);

  // Sync Radius Circle
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.ymaps) return;

    if (circleInstanceRef.current) {
      mapInstanceRef.current.geoObjects.remove(circleInstanceRef.current);
      circleInstanceRef.current = null;
    }

    if (selectedMapCenter) {
      const circle = new window.ymaps.Circle(
        [[selectedMapCenter.lat, selectedMapCenter.lng], selectedRadiusMeters],
        {
          hintContent: `Qidiruv radiusi: ${selectedRadiusMeters >= 1000 ? (selectedRadiusMeters / 1000) + ' km' : selectedRadiusMeters + ' metr'}`
        },
        {
          draggable: true,
          fillColor: '#10b98122',
          strokeColor: '#059669',
          strokeOpacity: 0.8,
          strokeWidth: 2
        }
      );

      circle.events.add('dragend', () => {
        const coords = circle.geometry.getCoordinates();
        setMapSelection({ lat: coords[0], lng: coords[1] }, selectedRadiusMeters);
      });

      mapInstanceRef.current.geoObjects.add(circle);
      circleInstanceRef.current = circle;
    }
  }, [isMapReady, selectedMapCenter, selectedRadiusMeters]);

  // Map controls
  const handleZoomIn = () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() + 1, { duration: 200 });
  const handleZoomOut = () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() - 1, { duration: 200 });
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        mapInstanceRef.current?.setCenter(coords, 14, { duration: 300 });
        setMapSelection({ lat: coords[0], lng: coords[1] });
      });
    }
  };

  const handleToggleLayer = () => {
    if (!mapInstanceRef.current) return;
    const nextType = mapType === 'map' ? 'hybrid' : 'map';
    mapInstanceRef.current.setType(`yandex#${nextType}`);
    setMapType(nextType);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-100 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Radius Selector Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur rounded-2xl shadow-floating border border-slate-200/80 p-2 flex flex-col gap-2 max-w-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-slate-700">
          <MapPin className="w-4 h-4 text-brand-600" />
          <span>{language === 'uz' ? 'Radius orqali qidiruv' : 'Поиск по радиусу'}:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { label: '500m', value: 500 },
            { label: '1km', value: 1000 },
            { label: '2km', value: 2000 },
            { label: '5km', value: 5000 },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => {
                const center = selectedMapCenter || { lat: 41.2721, lng: 69.2045 }; // default Chilonzor
                setMapSelection(center, r.value);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedRadiusMeters === r.value && selectedMapCenter
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {selectedMapCenter && (
          <button
            onClick={() => setMapSelection(null)}
            className="text-[11px] text-rose-600 hover:underline font-semibold text-center mt-0.5"
          >
            {language === 'uz' ? 'Radiusni bekor qilish' : 'Сбросить радиус'}
          </button>
        )}
      </div>

      {/* Map Navigation Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-floating border border-slate-200/80 overflow-hidden flex flex-col">
          <button
            onClick={handleZoomIn}
            className="p-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-600 border-b border-slate-100 transition-colors"
            title="Kattalashtirish"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            title="Kichiklashtirish"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleLocateMe}
          className="p-2.5 bg-white/95 backdrop-blur rounded-xl shadow-floating border border-slate-200/80 text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          title="Mening joylashuvim"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleLayer}
          className="p-2.5 bg-white/95 backdrop-blur rounded-xl shadow-floating border border-slate-200/80 text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          title="Xarita / Sputnik rejimi"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
