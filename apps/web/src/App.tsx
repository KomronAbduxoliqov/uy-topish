import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AiSearchHero } from './features/search/AiSearchHero';
import { FilterBar } from './features/search/FilterBar';
import { PropertyGrid } from './features/properties/PropertyGrid';
import { YandexMap } from './features/map/YandexMap';
import { PropertyDetailModal } from './features/properties/PropertyDetailModal';
import { PropertyCompareModal } from './features/properties/PropertyCompareModal';
import { PropertyCreationWizard } from './features/wizard/PropertyCreationWizard';
import { AuthModal } from './features/auth/AuthModal';
import { ModerationModal } from './features/admin/ModerationModal';
import { useAppStore } from './store/useAppStore';
import { apiClient } from './api/client';
import { Map, List } from 'lucide-react';

export const App: React.FC = () => {
  const {
    filters,
    setProperties,
    setIsLoadingProperties,
    isMobileMapView,
    setIsMobileMapView
  } = useAppStore();

  // Load properties whenever filters change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingProperties(true);
      try {
        const res = await apiClient.searchProperties(filters);
        if (isMounted) {
          setProperties(res.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoadingProperties(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero AI Search Section */}
      <AiSearchHero />

      {/* Faceted Filter Bar */}
      <FilterBar />

      {/* Main Responsive Split Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative">
        {/* Left Side: Property Cards Grid (Desktop) */}
        <div
          className={`lg:w-[50%] xl:w-[48%] overflow-y-auto lg:h-[calc(100vh-230px)] lg:border-r border-slate-200 ${
            isMobileMapView ? 'hidden lg:block' : 'block'
          }`}
        >
          <PropertyGrid />
        </div>

        {/* Right Side: Interactive Yandex Map (Desktop & Mobile) */}
        <div
          className={`lg:w-[50%] xl:w-[52%] sticky top-0 lg:h-[calc(100vh-230px)] ${
            isMobileMapView ? 'block h-[calc(100vh-230px)]' : 'hidden lg:block'
          }`}
        >
          <YandexMap />
        </div>
      </main>

      {/* Floating Mobile Map / List Toggle Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
        <button
          onClick={() => setIsMobileMapView(!isMobileMapView)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white font-bold text-sm rounded-full shadow-floating border border-slate-700 active:scale-95 transition-all"
        >
          {isMobileMapView ? (
            <>
              <List className="w-4 h-4 text-brand-400" />
              <span>Ro'yxatni ko'rish</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4 text-brand-400" />
              <span>Xaritada ko'rish</span>
            </>
          )}
        </button>
      </div>

      {/* Global Modals & Wizards */}
      <PropertyDetailModal />
      <PropertyCompareModal />
      <PropertyCreationWizard />
      <AuthModal />
      <ModerationModal />
    </div>
  );
};
