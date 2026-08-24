'use client';

import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Global keyboard shortcuts hook for UyTop.
 *
 * Shortcuts:
 * - ESC: Close topmost open modal/drawer in priority order
 * - Ctrl+K / Cmd+K: Open AI search drawer
 * - Ctrl+Shift+N: Open property creation wizard
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = Boolean(
        target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable ||
            target.getAttribute?.('contenteditable') === 'true')
      );

      // Do not trigger shortcuts when user is typing in input elements
      if (isTyping) {
        return;
      }

      // 1. ESC: Close any open modal/drawer in priority order
      if (event.key === 'Escape' || event.key === 'Esc') {
        const state = useAppStore.getState();

        if (state.isAiHomeFinderOpen) {
          event.preventDefault();
          state.setIsAiHomeFinderOpen(false);
          return;
        }

        if (state.isAiDrawerOpen) {
          event.preventDefault();
          state.setIsAiDrawerOpen(false);
          return;
        }

        if (state.activePropertyId) {
          event.preventDefault();
          state.setActivePropertyId(null);
          return;
        }

        if (state.isWizardOpen) {
          event.preventDefault();
          state.setIsWizardOpen(false);
          return;
        }

        if (state.isAuthModalOpen) {
          event.preventDefault();
          state.setIsAuthModalOpen(false);
          return;
        }

        if (state.isCompareModalOpen) {
          event.preventDefault();
          state.setIsCompareModalOpen(false);
          return;
        }

        if (state.isModerationModalOpen) {
          event.preventDefault();
          state.setIsModerationModalOpen(false);
          return;
        }

        if (state.isFavoritesModalOpen) {
          event.preventDefault();
          state.setIsFavoritesModalOpen(false);
          return;
        }

        if (state.isMortgageModalOpen) {
          event.preventDefault();
          state.setIsMortgageModalOpen(false);
          return;
        }

        if (state.isValuationModalOpen) {
          event.preventDefault();
          state.setIsValuationModalOpen(false);
          return;
        }

        if (state.isAlertModalOpen) {
          event.preventDefault();
          state.setIsAlertModalOpen(false);
          return;
        }

        if (state.isAdvancedFiltersOpen) {
          event.preventDefault();
          state.setIsAdvancedFiltersOpen(false);
          return;
        }

        if (state.isRecentDrawerOpen) {
          event.preventDefault();
          state.setIsRecentDrawerOpen(false);
          return;
        }

        if (state.isSavedProfilesOpen) {
          event.preventDefault();
          state.setIsSavedProfilesOpen(false);
          return;
        }

        return;
      }

      const isModifier = event.ctrlKey || event.metaKey;

      // 2. Ctrl+Shift+N or Cmd+Shift+N: Open property creation wizard
      if (isModifier && event.shiftKey && (event.key.toLowerCase() === 'n' || event.code === 'KeyN')) {
        event.preventDefault();
        useAppStore.getState().setIsWizardOpen(true);
        return;
      }

      // 3. Ctrl+K or Cmd+K: Open AI search drawer
      if (isModifier && !event.shiftKey && (event.key.toLowerCase() === 'k' || event.code === 'KeyK')) {
        event.preventDefault();
        useAppStore.getState().setIsAiDrawerOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
