'use client';

import { create } from 'zustand';
import {
  Property,
  PropertySearchFilters,
  TransactionType,
  PropertyType,
  UserProfile,
  ParsedAIIntent
} from '@uytop/shared-types';
import { Language } from '../i18n';
import { apiClient } from '../lib/api/client';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;

  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile | null, token?: string | null) => void;
  logout: () => void;

  filters: PropertySearchFilters;
  setFilters: (filters: Partial<PropertySearchFilters>) => void;
  resetFilters: () => void;

  advancedFilters: {
    minArea?: number;
    maxArea?: number;
    minFloor?: number;
    maxFloor?: number;
    notFirstFloor?: boolean;
    notLastFloor?: boolean;
    buildingType?: string[];
    renovation?: string[];
    hasLift?: boolean;
    hasParking?: boolean;
    hasBalcony?: boolean;
    hasAC?: boolean;
  };
  setAdvancedFilters: (filters: Partial<AppState['advancedFilters']>) => void;
  resetAdvancedFilters: () => void;
  isAdvancedFiltersOpen: boolean;
  setIsAdvancedFiltersOpen: (open: boolean) => void;

  properties: Property[];
  setProperties: (properties: Property[]) => void;
  isLoadingProperties: boolean;
  setIsLoadingProperties: (loading: boolean) => void;

  activePropertyId: string | null;
  setActivePropertyId: (id: string | null) => void;

  selectedMapCenter: { lat: number; lng: number } | null;
  selectedRadiusMeters: number;
  setMapSelection: (coords: { lat: number; lng: number } | null, radiusMeters?: number) => void;

  favorites: string[];
  toggleFavorite: (propertyId: string) => void;

  compareList: string[];
  toggleCompare: (propertyId: string) => void;
  clearCompare: () => void;

  lastParsedAiIntent: ParsedAIIntent | null;
  setLastParsedAiIntent: (intent: ParsedAIIntent | null) => void;

  // Modals & Drawers
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;

  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  isModerationModalOpen: boolean;
  setIsModerationModalOpen: (open: boolean) => void;

  currency: 'UZS' | 'USD';
  setCurrency: (currency: 'UZS' | 'USD') => void;

  isFavoritesModalOpen: boolean;
  setIsFavoritesModalOpen: (open: boolean) => void;

  isMortgageModalOpen: boolean;
  setIsMortgageModalOpen: (open: boolean) => void;
  mortgageInitialPrice: number;
  setMortgageInitialPrice: (price: number) => void;

  isValuationModalOpen: boolean;
  setIsValuationModalOpen: (open: boolean) => void;

  isAlertModalOpen: boolean;
  setIsAlertModalOpen: (open: boolean) => void;

  isMobileMapView: boolean;
  setIsMobileMapView: (isMap: boolean) => void;

  // Recently Viewed Properties
  recentlyViewed: string[];
  addRecentlyViewed: (propertyId: string) => void;
  clearRecentlyViewed: () => void;
  isRecentDrawerOpen: boolean;
  setIsRecentDrawerOpen: (open: boolean) => void;

  // AI Personal Home Finder State
  isAiHomeFinderOpen: boolean;
  setIsAiHomeFinderOpen: (open: boolean) => void;
  aiFinderMessages: any[];
  setAiFinderMessages: (messages: any[]) => void;
  addAiFinderMessage: (message: any) => void;
  aiFinderPreferences: any;
  setAiFinderPreferences: (prefs: any) => void;
  resetAiFinder: () => void;
  resetAiFinderMessages: () => void;
  aiFinderRecommendations: any[];
  setAiFinderRecommendations: (recs: any[]) => void;
  isSavedProfilesOpen: boolean;
  setIsSavedProfilesOpen: (open: boolean) => void;

  // Reporting & Fraud Protection
  reportingPropertyId: string | null;
  setReportingPropertyId: (id: string | null) => void;

  // Legal Rental Contract Generator State
  isContractModalOpen: boolean;
  setIsContractModalOpen: (open: boolean) => void;
  contractProperty: Property | null;
  setContractProperty: (property: Property | null) => void;

  // Toast Notifications
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_FILTERS: PropertySearchFilters = {
  transactionType: TransactionType.RENT,
  propertyType: undefined,
  district: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  rooms: undefined,
  furnished: undefined,
  nearMetro: undefined,
  centerLat: undefined,
  centerLng: undefined,
  radiusMeters: 2000,
  sortBy: 'newest',
  page: 1,
  limit: 30
};

export const useAppStore = create<AppState>((set) => ({
  language: 'uz',
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('uytop_lang', language);
    }
    set({ language });
  },

  user: null,
  token: null,
  // Access tokens intentionally stay in memory; persistent browser storage makes them available to XSS.
  setUser: (user, token) => {
    apiClient.setAccessToken(user && token ? token : null);
    set(user && token ? { user, token } : { user: null, token: null });
  },
  logout: () => {
    apiClient.setAccessToken(null);
    set({ user: null, token: null });
  },

  filters: DEFAULT_FILTERS,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () =>
    set({
      filters: DEFAULT_FILTERS,
      selectedMapCenter: null,
      lastParsedAiIntent: null
    }),

  advancedFilters: {},
  setAdvancedFilters: (newFilters) =>
    set((state) => ({
      advancedFilters: { ...state.advancedFilters, ...newFilters }
    })),
  resetAdvancedFilters: () => set({ advancedFilters: {} }),
  isAdvancedFiltersOpen: false,
  setIsAdvancedFiltersOpen: (isAdvancedFiltersOpen) => set({ isAdvancedFiltersOpen }),

  properties: [],
  setProperties: (properties) => set({ properties }),
  isLoadingProperties: false,
  setIsLoadingProperties: (isLoadingProperties) => set({ isLoadingProperties }),

  activePropertyId: null,
  setActivePropertyId: (activePropertyId) => set({ activePropertyId }),

  selectedMapCenter: null,
  selectedRadiusMeters: 2000,
  setMapSelection: (selectedMapCenter, radiusMeters) =>
    set((state) => ({
      selectedMapCenter,
      selectedRadiusMeters: radiusMeters ?? state.selectedRadiusMeters,
      filters: {
        ...state.filters,
        centerLat: selectedMapCenter?.lat,
        centerLng: selectedMapCenter?.lng,
        radiusMeters: radiusMeters ?? state.selectedRadiusMeters
      }
    })),

  favorites: [],
  toggleFavorite: (propertyId) =>
    set((state) => {
      const exists = state.favorites.includes(propertyId);
      const updated = exists
        ? state.favorites.filter((id) => id !== propertyId)
        : [...state.favorites, propertyId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('uytop_favs', JSON.stringify(updated));
      }
      return { favorites: updated };
    }),

  compareList: [],
  toggleCompare: (propertyId) =>
    set((state) => {
      const exists = state.compareList.includes(propertyId);
      if (exists) {
        return { compareList: state.compareList.filter((id) => id !== propertyId) };
      }
      if (state.compareList.length >= 4) {
        // Will trigger toast via setTimeout to avoid set-inside-set
        setTimeout(() => useAppStore.getState().showToast("Ko'pi bilan 4 ta mulkni solishtirish mumkin", 'warning'), 0);
        return state;
      }
      return { compareList: [...state.compareList, propertyId] };
    }),
  clearCompare: () => set({ compareList: [] }),

  lastParsedAiIntent: null,
  setLastParsedAiIntent: (lastParsedAiIntent) => set({ lastParsedAiIntent }),

  isAiDrawerOpen: false,
  setIsAiDrawerOpen: (isAiDrawerOpen) => set({ isAiDrawerOpen }),

  isWizardOpen: false,
  setIsWizardOpen: (isWizardOpen) => set({ isWizardOpen }),

  isAuthModalOpen: false,
  setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),

  isCompareModalOpen: false,
  setIsCompareModalOpen: (isCompareModalOpen) => set({ isCompareModalOpen }),

  isModerationModalOpen: false,
  setIsModerationModalOpen: (isModerationModalOpen) => set({ isModerationModalOpen }),

  currency: 'UZS',
  setCurrency: (currency) => set({ currency }),

  isFavoritesModalOpen: false,
  setIsFavoritesModalOpen: (isFavoritesModalOpen) => set({ isFavoritesModalOpen }),

  isMortgageModalOpen: false,
  setIsMortgageModalOpen: (isMortgageModalOpen) => set({ isMortgageModalOpen }),
  mortgageInitialPrice: 600000000,
  setMortgageInitialPrice: (mortgageInitialPrice) => set({ mortgageInitialPrice }),

  isValuationModalOpen: false,
  setIsValuationModalOpen: (isValuationModalOpen) => set({ isValuationModalOpen }),

  isAlertModalOpen: false,
  setIsAlertModalOpen: (isAlertModalOpen) => set({ isAlertModalOpen }),

  isMobileMapView: false,
  setIsMobileMapView: (isMobileMapView) => set({ isMobileMapView }),

  recentlyViewed: [],
  addRecentlyViewed: (propertyId) => set((state) => {
    const filtered = state.recentlyViewed.filter(id => id !== propertyId);
    const updated = [propertyId, ...filtered].slice(0, 10);
    if (typeof window !== 'undefined') localStorage.setItem('uytop_recent', JSON.stringify(updated));
    return { recentlyViewed: updated };
  }),
  clearRecentlyViewed: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('uytop_recent');
    set({ recentlyViewed: [] });
  },
  isRecentDrawerOpen: false,
  setIsRecentDrawerOpen: (isRecentDrawerOpen) => set({ isRecentDrawerOpen }),

  // AI Personal Home Finder Implementation
  isAiHomeFinderOpen: false,
  setIsAiHomeFinderOpen: (isAiHomeFinderOpen) => set({ isAiHomeFinderOpen }),
  aiFinderMessages: [],
  setAiFinderMessages: (aiFinderMessages) => set({ aiFinderMessages }),
  addAiFinderMessage: (msg) => set((state) => ({ aiFinderMessages: [...state.aiFinderMessages, msg] })),
  aiFinderPreferences: {},
  setAiFinderPreferences: (prefs) => set((state) => ({ aiFinderPreferences: { ...state.aiFinderPreferences, ...prefs } })),
  resetAiFinder: () => set({ aiFinderMessages: [], aiFinderPreferences: {}, aiFinderRecommendations: [] }),
  resetAiFinderMessages: () => set({ aiFinderMessages: [] }),
  aiFinderRecommendations: [],
  setAiFinderRecommendations: (aiFinderRecommendations) => set({ aiFinderRecommendations }),
  isSavedProfilesOpen: false,
  setIsSavedProfilesOpen: (isSavedProfilesOpen) => set({ isSavedProfilesOpen }),

  reportingPropertyId: null,
  setReportingPropertyId: (reportingPropertyId) => set({ reportingPropertyId }),

  // Legal Rental Contract Generator
  isContractModalOpen: false,
  setIsContractModalOpen: (isContractModalOpen) => set({ isContractModalOpen }),
  contractProperty: null,
  setContractProperty: (contractProperty) => set({ contractProperty }),

  // Toast Notifications
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));
