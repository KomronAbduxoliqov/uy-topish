import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// Mock window.ymaps for client test environment
Object.defineProperty(window, 'ymaps', {
  value: {
    ready: (cb: () => void) => cb(),
    Map: vi.fn().mockImplementation(() => ({
      events: { add: vi.fn() },
      geoObjects: { add: vi.fn(), remove: vi.fn() },
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getZoom: () => 12,
      setType: vi.fn(),
      destroy: vi.fn(),
    })),
    GeoObjectCollection: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      removeAll: vi.fn(),
    })),
    Placemark: vi.fn().mockImplementation(() => ({
      events: { add: vi.fn() },
    })),
    Circle: vi.fn().mockImplementation(() => ({
      events: { add: vi.fn() },
      geometry: { getCoordinates: () => [41.2745, 69.2065] },
    })),
    templateLayoutFactory: {
      createClass: vi.fn().mockReturnValue({}),
    },
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock alert
window.alert = vi.fn();

// Mock scrollTo
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
