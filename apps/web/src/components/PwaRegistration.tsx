'use client';

import { useEffect } from 'react';

/**
 * PWA Service Worker Registration Component
 * Registers the service worker for offline caching, installability,
 * and push notification readiness.
 */
export function PwaRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Delay registration to avoid blocking initial page load
    const timer = setTimeout(() => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Auto-update check every 60 minutes
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((err) => {
          console.warn('SW registration failed:', err);
        });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
