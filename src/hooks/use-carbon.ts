"use client";

import { useCallback, useEffect } from "react";
import { useCarbonStore } from "@/stores/carbon.store";
import type {
  CarbonEntryResult,
  CalculatorFormData,
} from "@/types/carbon.types";

/**
 * Custom hook wrapping the carbon Zustand store with convenient API interactions.
 * Provides data fetching, entry submission, and calculator functionality.
 *
 * @returns Carbon state and action methods
 */
export function useCarbon() {
  const store = useCarbonStore();

  /**
   * Fetch dashboard data on mount.
   */
  useEffect(() => {
    void store.fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.selectedMonth, store.selectedYear]);

  /**
   * Submit carbon entries to the API and refresh data.
   */
  const submitEntries = useCallback(
    async (entries: CarbonEntryResult[]) => {
      await store.addEntry(entries);
    },
    [store]
  );

  /**
   * Calculate footprint from calculator form without saving.
   * Calls the /api/carbon/calculate endpoint.
   */
  const calculateFromForm = useCallback(
    async (
      formData: CalculatorFormData
    ): Promise<CarbonEntryResult[] | null> => {
      try {
        const res = await fetch("/api/carbon/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          store.setEntries(json.data);
          return json.data as CarbonEntryResult[];
        }
        return null;
      } catch {
        return null;
      }
    },
    [store]
  );

  /**
   * Change the selected month and automatically refresh data.
   */
  const changeMonth = useCallback(
    (month: number, year: number) => {
      store.setMonth(month);
      store.setYear(year);
    },
    [store]
  );

  return {
    // State
    entries: store.entries,
    monthlyTotal: store.monthlyTotal,
    categoryBreakdown: store.categoryBreakdown,
    trendData: store.trendData,
    selectedMonth: store.selectedMonth,
    selectedYear: store.selectedYear,
    loading: store.loading,
    error: store.error,

    // Actions
    submitEntries,
    calculateFromForm,
    changeMonth,
    fetchTrends: store.fetchTrends,
    clearError: store.clearError,
  };
}
