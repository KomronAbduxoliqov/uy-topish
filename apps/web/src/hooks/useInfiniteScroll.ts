'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  /** Total items available */
  totalItems: number;
  /** Items per page / batch */
  batchSize: number;
  /** Root margin for IntersectionObserver (trigger early) */
  rootMargin?: string;
}

/**
 * Infinite scroll hook using IntersectionObserver.
 * Progressively reveals items without loading all at once.
 * Keeps RAM usage low even with 10,000+ listings.
 */
export function useInfiniteScroll({
  totalItems,
  batchSize,
  rootMargin = '400px'
}: UseInfiniteScrollOptions) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const hasMore = visibleCount < totalItems;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, totalItems));
  }, [batchSize, totalItems]);

  // Reset when total items change (new search results)
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [totalItems, batchSize]);

  // Setup IntersectionObserver
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loadMore, rootMargin]);

  return {
    visibleCount,
    hasMore,
    sentinelRef,
    reset: () => setVisibleCount(batchSize)
  };
}
