import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'student-courses-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCourseCache = () => {
  const [cache, setCache] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const isStale = useCallback((timestamp) => {
    return Date.now() - timestamp > CACHE_DURATION;
  }, []);

  const getCachedData = useCallback(() => {
    if (!cache || isStale(cache.timestamp)) {
      return null;
    }
    return cache.data;
  }, [cache, isStale]);

  const setCachedData = useCallback((data) => {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };

    setCache(cacheEntry);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache course data:', error);
    }
  }, []);

  const clearCache = useCallback(() => {
    setCache(null);
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear course cache:', error);
    }
  }, []);

  // Clean up expired cache on mount
  useEffect(() => {
    if (cache && isStale(cache.timestamp)) {
      clearCache();
    }
  }, [cache, isStale, clearCache]);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    isStale: cache ? isStale(cache.timestamp) : true,
  };
};