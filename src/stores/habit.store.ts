import { create } from "zustand";
import type {
  HabitLogEntry,
  HabitStreak,
  HabitImpactSummary,
  DailyCheckIn,
} from "@/types/habit.types";

/**
 * State shape for the habit tracking store.
 */
interface HabitState {
  /** Current month's habit log entries */
  habitLogs: HabitLogEntry[];
  /** Streak data for all habit types */
  streaks: HabitStreak[];
  /** CO2 impact summary */
  impact: HabitImpactSummary | null;
  /** Loading state for async operations */
  loading: boolean;
  /** Error message from last failed operation */
  error: string | null;
}

/**
 * Actions available on the habit store.
 */
interface HabitActions {
  /** Fetch habit logs for a given month */
  fetchHabits: (month: number, year: number) => Promise<void>;
  /** Log a daily check-in (batch of habits) */
  logHabit: (checkIn: DailyCheckIn) => Promise<void>;
  /** Fetch streak data for all habits */
  fetchStreaks: () => Promise<void>;
  /** Fetch the CO2 impact summary */
  fetchImpact: (days?: number) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Zustand store for habit tracking data.
 * Manages habit logs, streaks, and impact summaries with API fetch actions.
 */
export const useHabitStore = create<HabitState & HabitActions>((set) => ({
  // Initial state
  habitLogs: [],
  streaks: [],
  impact: null,
  loading: false,
  error: null,

  fetchHabits: async (month, year) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/habits?month=${month}&year=${year}`);
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      set({ habitLogs: json.data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch habits",
        loading: false,
      });
    }
  },

  logHabit: async (checkIn) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkIn),
      });
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      // Refresh streaks after logging
      const streakRes = await fetch("/api/habits/streaks");
      const streakJson = await streakRes.json();
      if (streakJson.success) {
        set({ streaks: streakJson.data });
      }
      set({ loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to log habit",
        loading: false,
      });
    }
  },

  fetchStreaks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/habits/streaks");
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      set({ streaks: json.data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch streaks",
        loading: false,
      });
    }
  },

  fetchImpact: async (days = 30) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/habits/impact?days=${days}`);
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      set({ impact: json.data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch impact",
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
