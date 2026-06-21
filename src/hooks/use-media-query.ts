"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Predefined breakpoints matching Tailwind CSS defaults.
 */
const BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Custom hook for responsive breakpoint detection via `matchMedia`.
 * Listens for viewport changes and returns whether the query matches.
 *
 * Can accept a custom media query string or a Tailwind breakpoint key.
 *
 * @param query - A CSS media query string or Tailwind breakpoint key (sm, md, lg, xl, 2xl)
 * @returns Whether the media query currently matches
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery("lg");
 * const isMobile = useMediaQuery("(max-width: 639px)");
 *
 * return isDesktop ? <DesktopLayout /> : <MobileLayout />;
 * ```
 */
export function useMediaQuery(query: string | BreakpointKey): boolean {
  const resolvedQuery =
    query in BREAKPOINTS
      ? BREAKPOINTS[query as BreakpointKey]
      : query;

  const getMatches = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(resolvedQuery).matches;
  }, [resolvedQuery]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(resolvedQuery);

    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [resolvedQuery]);

  return matches;
}
