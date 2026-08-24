import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { TransactionType, PropertyType, UserRole } from '@uytop/shared-types';

describe('useAppStore (Zustand Global Store)', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.setState({
      language: 'uz',
      filters: {},
      favorites: [],
      compareList: [],
      activePropertyId: null,
      selectedMapCenter: null,
      selectedRadiusMeters: 1000,
      user: null,
      token: null,
      isAuthModalOpen: false,
      isWizardOpen: false,
      isCompareModalOpen: false,
      isModerationModalOpen: false,
    });
  });

  it('updates and resets faceted filters correctly', () => {
    const { setFilters, resetFilters } = useAppStore.getState();

    setFilters({
      district: 'Chilonzor',
      transactionType: TransactionType.RENT,
      rooms: [2],
      maxPrice: 4000000,
    });

    let state = useAppStore.getState();
    expect(state.filters.district).toBe('Chilonzor');
    expect(state.filters.transactionType).toBe(TransactionType.RENT);
    expect(state.filters.rooms).toEqual([2]);
    expect(state.filters.maxPrice).toBe(4000000);

    resetFilters();
    state = useAppStore.getState();
    expect(state.filters).toEqual({});
    expect(state.selectedMapCenter).toBeNull();
  });

  it('handles favorites toggle and avoids duplicates', () => {
    const { toggleFavorite } = useAppStore.getState();
    const propId = '11111111-1111-1111-1111-111111111101';

    // Add to favorites
    toggleFavorite(propId);
    expect(useAppStore.getState().favorites).toContain(propId);

    // Toggle off (remove)
    toggleFavorite(propId);
    expect(useAppStore.getState().favorites).not.toContain(propId);
  });

  it('manages property comparison list with max 4 items constraint', () => {
    const { toggleCompare, clearCompare } = useAppStore.getState();

    toggleCompare('prop-1');
    toggleCompare('prop-2');
    toggleCompare('prop-3');
    toggleCompare('prop-4');

    expect(useAppStore.getState().compareList.length).toBe(4);

    // Attempting 5th item should not exceed 4 items
    toggleCompare('prop-5');
    expect(useAppStore.getState().compareList.length).toBe(4);

    clearCompare();
    expect(useAppStore.getState().compareList).toEqual([]);
  });

  it('updates map selection coordinates and radius', () => {
    const { setMapSelection } = useAppStore.getState();

    setMapSelection({ lat: 41.2745, lng: 69.2065 }, 2000);

    const state = useAppStore.getState();
    expect(state.selectedMapCenter).toEqual({ lat: 41.2745, lng: 69.2065 });
    expect(state.selectedRadiusMeters).toBe(2000);
  });

  it('handles user authentication and logout session cleanup', () => {
    const { setUser, logout } = useAppStore.getState();

    setUser(
      {
        id: 'usr-1',
        phone: '+998901234567',
        fullName: 'Rustam Karimov',
        role: UserRole.OWNER,
        verificationStatus: 'PHONE_VERIFIED' as any,
        createdAt: new Date().toISOString(),
      },
      'jwt_mock_token_123'
    );

    let state = useAppStore.getState();
    expect(state.user?.fullName).toBe('Rustam Karimov');
    expect(state.user?.role).toBe(UserRole.OWNER);
    expect(state.token).toBe('jwt_mock_token_123');

    logout();
    state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
