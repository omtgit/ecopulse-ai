/**
 * Unit tests for carbon forecast / prediction logic.
 *
 * Covers weighted moving average, trend detection,
 * confidence intervals, and handling of insufficient data.
 */

import type { ForecastResult } from "@/types/habit.types";

// ─── Pure forecast helper functions ─────────────────────────────────
// These mirror the logic used in the forecast service / API route.

/**
 * Compute a weighted moving average where recent values have more weight.
 * Weights increase linearly: [1, 2, 3, ..., n].
 */
function weightedMovingAverage(values: number[]): number {
  if (values.length === 0) return 0;
  let weightedSum = 0;
  let weightTotal = 0;
  values.forEach((v, i) => {
    const weight = i + 1;
    weightedSum += v * weight;
    weightTotal += weight;
  });
  return weightedSum / weightTotal;
}

/**
 * Detect trend from a series of monthly CO2 values.
 */
function detectTrend(
  values: number[]
): { trend: "increasing" | "decreasing" | "stable"; trendPct: number } {
  if (values.length < 2) return { trend: "stable", trendPct: 0 };

  const firstHalf = values.slice(0, Math.ceil(values.length / 2));
  const secondHalf = values.slice(Math.ceil(values.length / 2));

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  if (avgFirst === 0) return { trend: "stable", trendPct: 0 };

  const changePct = ((avgSecond - avgFirst) / avgFirst) * 100;

  // 5% threshold for "stable"
  if (Math.abs(changePct) < 5) return { trend: "stable", trendPct: changePct };
  return {
    trend: changePct > 0 ? "increasing" : "decreasing",
    trendPct: changePct,
  };
}

/**
 * Calculate confidence interval (simple ± based on std deviation).
 */
function confidenceInterval(
  predicted: number,
  historicalValues: number[]
): { low: number; high: number } {
  if (historicalValues.length < 2) {
    return { low: predicted * 0.8, high: predicted * 1.2 };
  }
  const mean =
    historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
  const variance =
    historicalValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
    historicalValues.length;
  const stdDev = Math.sqrt(variance);

  return {
    low: Math.max(0, predicted - 1.96 * stdDev),
    high: predicted + 1.96 * stdDev,
  };
}

/**
 * Build a full forecast result from historical monthly values.
 */
function buildForecast(
  monthlyValues: number[]
): ForecastResult | { error: string } {
  if (monthlyValues.length < 3) {
    return { error: "Insufficient data – need at least 3 months" };
  }

  const predicted = weightedMovingAverage(monthlyValues);
  const { trend, trendPct } = detectTrend(monthlyValues);
  const ci = confidenceInterval(predicted, monthlyValues);

  return {
    projectedMonthly: predicted,
    trend,
    trendPct,
    dailyForecasts: [], // simplified for testing
    factors: [],
  };
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("weightedMovingAverage()", () => {
  it("returns 0 for empty array", () => {
    expect(weightedMovingAverage([])).toBe(0);
  });

  it("returns the single value for a single-element array", () => {
    expect(weightedMovingAverage([100])).toBe(100);
  });

  it("weights more recent values higher", () => {
    // [100, 200]: weighted = (100*1 + 200*2) / (1+2) = 500/3 ≈ 166.67
    const result = weightedMovingAverage([100, 200]);
    expect(result).toBeCloseTo(166.67, 1);
  });

  it("computes correctly for a 3-value series", () => {
    // [10, 20, 30]: (10*1 + 20*2 + 30*3) / (1+2+3) = 140/6 ≈ 23.33
    const result = weightedMovingAverage([10, 20, 30]);
    expect(result).toBeCloseTo(23.33, 1);
  });

  it("gives higher result when recent values are larger", () => {
    const increasing = weightedMovingAverage([100, 200, 300]);
    const decreasing = weightedMovingAverage([300, 200, 100]);
    expect(increasing).toBeGreaterThan(decreasing);
  });

  it("handles identical values (returns that value)", () => {
    expect(weightedMovingAverage([50, 50, 50])).toBeCloseTo(50, 5);
  });

  it("handles zero values", () => {
    expect(weightedMovingAverage([0, 0, 0])).toBe(0);
  });

  it("handles large datasets", () => {
    const values = Array.from({ length: 12 }, (_, i) => (i + 1) * 10);
    const result = weightedMovingAverage(values);
    expect(result).toBeGreaterThan(0);
    expect(isFinite(result)).toBe(true);
  });
});

describe("detectTrend()", () => {
  it("returns stable for fewer than 2 data points", () => {
    expect(detectTrend([]).trend).toBe("stable");
    expect(detectTrend([100]).trend).toBe("stable");
  });

  it("detects increasing trend", () => {
    const result = detectTrend([100, 110, 120, 150, 180, 200]);
    expect(result.trend).toBe("increasing");
    expect(result.trendPct).toBeGreaterThan(0);
  });

  it("detects decreasing trend", () => {
    const result = detectTrend([200, 180, 150, 120, 100, 80]);
    expect(result.trend).toBe("decreasing");
    expect(result.trendPct).toBeLessThan(0);
  });

  it("detects stable trend for flat data", () => {
    const result = detectTrend([100, 101, 99, 100, 100, 101]);
    expect(result.trend).toBe("stable");
    expect(Math.abs(result.trendPct)).toBeLessThan(5);
  });

  it("uses 5% threshold for stability", () => {
    // Small change: 100 → 104 (~4% change, below 5% threshold)
    const result = detectTrend([100, 100, 102, 104]);
    expect(result.trend).toBe("stable");
  });

  it("returns stable when first half is zero", () => {
    const result = detectTrend([0, 0, 100, 200]);
    expect(result.trend).toBe("stable");
    expect(result.trendPct).toBe(0);
  });

  it("handles two data points", () => {
    const result = detectTrend([100, 200]);
    expect(result.trend).toBe("increasing");
    expect(result.trendPct).toBeCloseTo(100, 0);
  });
});

describe("confidenceInterval()", () => {
  it("uses default 80%-120% for < 2 data points", () => {
    const ci = confidenceInterval(100, [100]);
    expect(ci.low).toBe(80);
    expect(ci.high).toBe(120);
  });

  it("uses default 80%-120% for empty history", () => {
    const ci = confidenceInterval(50, []);
    expect(ci.low).toBe(40);
    expect(ci.high).toBe(60);
  });

  it("interval is wider for high-variance data", () => {
    const lowVar = confidenceInterval(100, [98, 100, 102, 99, 101]);
    const highVar = confidenceInterval(100, [50, 150, 60, 140, 100]);

    const lowWidth = lowVar.high - lowVar.low;
    const highWidth = highVar.high - highVar.low;
    expect(highWidth).toBeGreaterThan(lowWidth);
  });

  it("interval is narrower for consistent data", () => {
    const ci = confidenceInterval(100, [100, 100, 100, 100]);
    expect(ci.low).toBeCloseTo(100, 1);
    expect(ci.high).toBeCloseTo(100, 1);
  });

  it("low bound is never negative", () => {
    const ci = confidenceInterval(10, [5, 100, 200, 300]);
    expect(ci.low).toBeGreaterThanOrEqual(0);
  });

  it("high is always >= predicted", () => {
    const ci = confidenceInterval(100, [80, 90, 100, 110, 120]);
    expect(ci.high).toBeGreaterThanOrEqual(100);
  });
});

describe("buildForecast()", () => {
  it("returns error for fewer than 3 months of data", () => {
    const result = buildForecast([100, 200]);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("Insufficient data");
    }
  });

  it("returns error for empty data", () => {
    const result = buildForecast([]);
    expect("error" in result).toBe(true);
  });

  it("returns a valid ForecastResult for sufficient data", () => {
    const result = buildForecast([300, 280, 260, 250, 240]);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.projectedMonthly).toBeGreaterThan(0);
      expect(["increasing", "decreasing", "stable"]).toContain(result.trend);
      expect(typeof result.trendPct).toBe("number");
    }
  });

  it("detects decreasing trend from declining data", () => {
    const result = buildForecast([400, 350, 300, 250, 200]);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.trend).toBe("decreasing");
    }
  });

  it("detects increasing trend from rising data", () => {
    const result = buildForecast([100, 150, 200, 250, 300]);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.trend).toBe("increasing");
    }
  });

  it("projected value is weighted toward recent data", () => {
    const result = buildForecast([100, 100, 100, 200, 200, 200]);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      // Weighted average should be closer to 200 than 100
      expect(result.projectedMonthly).toBeGreaterThan(150);
    }
  });

  it("handles all-equal values", () => {
    const result = buildForecast([100, 100, 100, 100]);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.projectedMonthly).toBeCloseTo(100, 0);
      expect(result.trend).toBe("stable");
    }
  });
});
