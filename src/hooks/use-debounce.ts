"use client";

import { useState, useEffect } from "react";

/**
 * Generic debounce hook that delays updating a value until
 * a specified period of inactivity.
 *
 * Useful for search inputs, form auto-saves, and other scenarios
 * where you want to reduce the frequency of expensive operations.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 500)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 300);
 *
 * useEffect(() => {
 *   // Only fires after 300ms of inactivity
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
