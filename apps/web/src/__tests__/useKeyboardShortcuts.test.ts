import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAppStore } from '../store/useAppStore';

describe('useKeyboardShortcuts Hook', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      isAiHomeFinderOpen: false,
      isAiDrawerOpen: false,
      activePropertyId: null,
      isWizardOpen: false,
      isAuthModalOpen: false,
      isCompareModalOpen: false,
      isModerationModalOpen: false,
      isFavoritesModalOpen: false,
      isMortgageModalOpen: false,
      isValuationModalOpen: false,
      isAlertModalOpen: false,
      isAdvancedFiltersOpen: false,
      isRecentDrawerOpen: false,
      isSavedProfilesOpen: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens AI drawer when Ctrl+K is pressed', () => {
    renderHook(() => useKeyboardShortcuts());

    expect(useAppStore.getState().isAiDrawerOpen).toBe(false);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        code: 'KeyK',
        ctrlKey: true,
        bubbles: true,
      })
    );

    expect(useAppStore.getState().isAiDrawerOpen).toBe(true);
  });

  it('opens AI drawer when Cmd+K (metaKey) is pressed', () => {
    renderHook(() => useKeyboardShortcuts());

    expect(useAppStore.getState().isAiDrawerOpen).toBe(false);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        code: 'KeyK',
        metaKey: true,
        bubbles: true,
      })
    );

    expect(useAppStore.getState().isAiDrawerOpen).toBe(true);
  });

  it('opens Wizard when Ctrl+Shift+N is pressed', () => {
    renderHook(() => useKeyboardShortcuts());

    expect(useAppStore.getState().isWizardOpen).toBe(false);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'N',
        code: 'KeyN',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      })
    );

    expect(useAppStore.getState().isWizardOpen).toBe(true);
  });

  it('opens Wizard when Cmd+Shift+N is pressed', () => {
    renderHook(() => useKeyboardShortcuts());

    expect(useAppStore.getState().isWizardOpen).toBe(false);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'n',
        code: 'KeyN',
        metaKey: true,
        shiftKey: true,
        bubbles: true,
      })
    );

    expect(useAppStore.getState().isWizardOpen).toBe(true);
  });

  it('closes modals in proper priority order when ESC is pressed', () => {
    renderHook(() => useKeyboardShortcuts());

    // 1. isAiHomeFinderOpen
    useAppStore.setState({ isAiHomeFinderOpen: true, isAiDrawerOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isAiHomeFinderOpen).toBe(false);
    expect(useAppStore.getState().isAiDrawerOpen).toBe(true);

    // 2. isAiDrawerOpen
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isAiDrawerOpen).toBe(false);

    // 3. activePropertyId
    useAppStore.setState({ activePropertyId: 'prop-123', isWizardOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().activePropertyId).toBeNull();
    expect(useAppStore.getState().isWizardOpen).toBe(true);

    // 4. isWizardOpen
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isWizardOpen).toBe(false);

    // 5. isAuthModalOpen
    useAppStore.setState({ isAuthModalOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isAuthModalOpen).toBe(false);

    // 6. isCompareModalOpen
    useAppStore.setState({ isCompareModalOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isCompareModalOpen).toBe(false);

    // 7. isModerationModalOpen
    useAppStore.setState({ isModerationModalOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isModerationModalOpen).toBe(false);

    // 8. isFavoritesModalOpen
    useAppStore.setState({ isFavoritesModalOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isFavoritesModalOpen).toBe(false);

    // 9. isMortgageModalOpen
    useAppStore.setState({ isMortgageModalOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isMortgageModalOpen).toBe(false);

    // 10. isValuationModalOpen
    useAppStore.setState({ isValuationModalOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isValuationModalOpen).toBe(false);

    // 11. isAlertModalOpen
    useAppStore.setState({ isAlertModalOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isAlertModalOpen).toBe(false);

    // 12. isAdvancedFiltersOpen
    useAppStore.setState({ isAdvancedFiltersOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isAdvancedFiltersOpen).toBe(false);

    // 13. isRecentDrawerOpen
    useAppStore.setState({ isRecentDrawerOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isRecentDrawerOpen).toBe(false);

    // 14. isSavedProfilesOpen
    useAppStore.setState({ isSavedProfilesOpen: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(useAppStore.getState().isSavedProfilesOpen).toBe(false);
  });

  it('ignores shortcuts when user is typing in input elements', () => {
    renderHook(() => useKeyboardShortcuts());

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      bubbles: true,
    });

    input.dispatchEvent(event);

    expect(useAppStore.getState().isAiDrawerOpen).toBe(false);

    // Test with textarea
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const wizardEvent = new KeyboardEvent('keydown', {
      key: 'n',
      code: 'KeyN',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    textarea.dispatchEvent(wizardEvent);
    expect(useAppStore.getState().isWizardOpen).toBe(false);

    // Cleanup
    document.body.removeChild(input);
    document.body.removeChild(textarea);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardShortcuts());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
