import { create } from "zustand";
import type {
  CarbonEntryResult,
  CategoryBreakdown,
  TrendDataPoint,
} from "@/types/carbon.types";
import type { DashboardData } from "@/types/api.types";

/**
 * State shape for the carbon footprint store.
 */
interface CarbonState {
  /** Latest calculated entries (not yet saved) */
  entries: CarbonEntryResult[];
  /** Monthly CO2 total in kg */
  monthlyTotal: number;
  /** Breakdown by emission category */
  categoryBreakdown: CategoryBreakdown[];
  /** Historical trend data points */
  trendData: TrendDataPoint[];
  /** Full dashboard data */
  dashboard: DashboardData | null;
  /** Currently selected month (1-12) */
  selectedMonth: number;
  /** Currently selected year */
  selectedYear: number;
  /** Loading state for async operations */
  loading: boolean;
  /** Error message from last failed operation */
  error: string | null;
}

/**
 * Actions available on the carbon store.
 */
interface CarbonActions {
  /** Fetch full dashboard data from API */
  fetchDashboard: () => Promise<void>;
  /** Submit and save carbon entries to the server */
  addEntry: (entries: CarbonEntryResult[]) => Promise<void>;
  /** Update the selected month filter */
  setMonth: (month: number) => void;
  /** Update the selected year filter */
  setYear: (year: number) => void;
  /** Fetch monthly summary for the selected month/year */
  fetchMonthlySummary: () => Promise<void>;
  /** Fetch trend data */
  fetchTrends: () => Promise<void>;
  /** Set locally calculated entries (before save) */
  setEntries: (entries: CarbonEntryResult[]) => void;
  /** Clear any error state */
  clearError: () => void;
}

const now = new Date();

/**
 * Zustand store for carbon footprint data.
 * Manages calculated entries, monthly summaries, trends, and dashboard state.
 */
export const useCarbonStore = create<CarbonState & CarbonActions>((set, get) => ({
  // Initial state
  entries: [],
  monthlyTotal: 0,
  categoryBreakdown: [],
  trendData: [],
  dashboard: null,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const { selectedMonth, selectedYear } = get();
      const res = await fetch(
        `/api/carbon?month=${selectedMonth}&year=${selectedYear}`
      );
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      const data = json.data;
      set({
        monthlyTotal: data.totalCo2Kg ?? 0,
        categoryBreakdown: data.categoryBreakdown ?? [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch dashboard",
        loading: false,
      });
    }
  },

  addEntry: async (entries) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      // Refresh dashboard data after saving
      await get().fetchDashboard();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to save entries",
        loading: false,
      });
    }
  },

  setMonth: (month) => set({ selectedMonth: month }),
  setYear: (year) => set({ selectedYear: year }),

  fetchMonthlySummary: async () => {
    set({ loading: true, error: null });
    try {
      const { selectedMonth, selectedYear } = get();
      const res = await fetch(
        `/api/carbon?month=${selectedMonth}&year=${selectedYear}`
      );
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      set({
        monthlyTotal: json.data.totalCo2Kg ?? 0,
        categoryBreakdown: json.data.categoryBreakdown ?? [],
        loading: false,
      });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch monthly summary",
        loading: false,
      });
    }
  },

  fetchTrends: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/carbon/trends");
      const json = await res.json();
      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }
      set({ trendData: json.data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch trends",
        loading: false,
      });
    }
  },

  setEntries: (entries) => set({ entries }),

  clearError: () => set({ error: null }),
}));
