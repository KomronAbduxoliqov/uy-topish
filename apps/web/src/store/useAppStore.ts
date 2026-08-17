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

  isMobileMapView: boolean;
  setIsMobileMapView: (isMap: boolean) => void;
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
  language: (localStorage.getItem('uytop_lang') as Language) || 'uz',
  setLanguage: (language) => {
    localStorage.setItem('uytop_lang', language);
    set({ language });
  },

  user: JSON.parse(localStorage.getItem('uytop_user') || 'null'),
  token: localStorage.getItem('uytop_token') || null,
  setUser: (user, token) => {
    if (user && token) {
      localStorage.setItem('uytop_user', JSON.stringify(user));
      localStorage.setItem('uytop_token', token);
      set({ user, token });
    } else {
      localStorage.removeItem('uytop_user');
      localStorage.removeItem('uytop_token');
      set({ user: null, token: null });
    }
  },
  logout: () => {
    localStorage.removeItem('uytop_user');
    localStorage.removeItem('uytop_token');
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

  favorites: JSON.parse(localStorage.getItem('uytop_favs') || '[]'),
  toggleFavorite: (propertyId) =>
    set((state) => {
      const exists = state.favorites.includes(propertyId);
      const updated = exists
        ? state.favorites.filter((id) => id !== propertyId)
        : [...state.favorites, propertyId];
      localStorage.setItem('uytop_favs', JSON.stringify(updated));
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
        alert("Ko'pi bilan 4 ta mulkni solishtirish mumkin");
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

  isMobileMapView: false,
  setIsMobileMapView: (isMobileMapView) => set({ isMobileMapView })
}));
