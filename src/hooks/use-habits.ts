"use client";

import { useCallback, useEffect } from "react";
import { useHabitStore } from "@/stores/habit.store";
import type { DailyCheckIn } from "@/types/habit.types";

/**
 * Custom hook wrapping the habit Zustand store with convenient API interactions.
 * Provides habit log fetching, daily check-in submission, streaks, and impact data.
 *
 * @param month - Month to fetch habit logs for (1-12)
 * @param year - Year to fetch habit logs for
 * @returns Habit state and action methods
 */
export function useHabits(month?: number, year?: number) {
  const store = useHabitStore();

  const currentMonth = month ?? new Date().getMonth() + 1;
  const currentYear = year ?? new Date().getFullYear();

  /**
   * Fetch habit logs on mount or when month/year changes.
   */
  useEffect(() => {
    void store.fetchHabits(currentMonth, currentYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  /**
   * Submit a daily check-in with multiple habits.
   */
  const submitCheckIn = useCallback(
    async (checkIn: DailyCheckIn) => {
      await store.logHabit(checkIn);
      // Refresh logs for the current view
      await store.fetchHabits(currentMonth, currentYear);
    },
    [store, currentMonth, currentYear]
  );

  /**
   * Fetch streak data for all habits.
   */
  const refreshStreaks = useCallback(async () => {
    await store.fetchStreaks();
  }, [store]);

  /**
   * Fetch impact summary.
   */
  const refreshImpact = useCallback(
    async (days?: number) => {
      await store.fetchImpact(days);
    },
    [store]
  );

  return {
    // State
    habitLogs: store.habitLogs,
    streaks: store.streaks,
    impact: store.impact,
    loading: store.loading,
    error: store.error,

    // Actions
    submitCheckIn,
    refreshStreaks,
    refreshImpact,
    clearError: store.clearError,
  };
}
