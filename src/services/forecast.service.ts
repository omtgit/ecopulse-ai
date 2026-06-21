import prisma from "@/lib/prisma";
import { HABIT_DEFINITIONS } from "@/constants/challenges";
import type { ForecastResult, ForecastPoint } from "@/types/habit.types";

/**
 * Predict CO2 emissions for the next 30 days using a weighted moving average
 * over the last 90 days. Factors in active habits and challenges for adjustment.
 *
 * Algorithm:
 * 1. Collect daily CO2 data for the past 90 days
 * 2. Apply exponential weighting (recent days weigh more)
 * 3. Detect trend direction (increasing / decreasing / stable)
 * 4. Generate daily forecast points with confidence intervals
 * 5. Adjust for active habit and challenge impact
 *
 * @param userId - The authenticated user's ID
 * @returns Forecast result with daily predictions, trend, and influencing factors
 */
export async function predictNext30Days(
  userId: string
): Promise<ForecastResult> {
  const now = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // 1. Get daily CO2 entries for the past 90 days
  const entries = await prisma.carbonEntry.findMany({
    where: {
      userId,
      date: { gte: ninetyDaysAgo, lte: now },
    },
    orderBy: { date: "asc" },
  });

  // Aggregate into daily totals
  const dailyTotals = new Map<string, number>();
  for (const entry of entries) {
    const dateKey = new Date(entry.date).toISOString().split("T")[0]!;
    dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + entry.co2Kg);
  }

  // Fill in missing days with 0
  const dailyValues: number[] = [];
  const checkDate = new Date(ninetyDaysAgo);
  while (checkDate <= now) {
    const key = checkDate.toISOString().split("T")[0]!;
    dailyValues.push(dailyTotals.get(key) ?? 0);
    checkDate.setDate(checkDate.getDate() + 1);
  }

  // 2. Calculate weighted moving average (exponential weighting)
  const alpha = 0.1; // smoothing factor
  let weightedAvg = dailyValues[0] ?? 0;
  for (let i = 1; i < dailyValues.length; i++) {
    weightedAvg = alpha * dailyValues[i]! + (1 - alpha) * weightedAvg;
  }

  // 3. Detect trend using linear regression on last 30 days
  const recent30 = dailyValues.slice(-30);
  const { slope, avgY } = linearRegression(recent30);

  let trend: "increasing" | "decreasing" | "stable";
  let trendPct: number;

  if (avgY === 0) {
    trend = "stable";
    trendPct = 0;
  } else {
    // Slope relative to average determines trend strength
    const relativeSlope = (slope * 30) / avgY;
    trendPct = Math.round(relativeSlope * 100 * 100) / 100;

    if (relativeSlope > 0.05) {
      trend = "increasing";
    } else if (relativeSlope < -0.05) {
      trend = "decreasing";
    } else {
      trend = "stable";
    }
  }

  // 4. Factor in active habits and challenges
  const [activeHabits, activeChallenges] = await Promise.all([
    prisma.habitLog.findMany({
      where: {
        userId,
        completed: true,
        date: {
          gte: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7
          ),
        },
      },
      select: { habitType: true },
    }),
    prisma.userChallenge.count({
      where: { userId, status: "ACTIVE" },
    }),
  ]);

  // Calculate daily habit offset
  const uniqueHabits = new Set(activeHabits.map((h) => h.habitType));
  let dailyHabitOffset = 0;
  for (const ht of uniqueHabits) {
    const def = HABIT_DEFINITIONS.find((h) => h.type === ht);
    if (def) {
      dailyHabitOffset += def.impactKgPerDay * 0.5; // 50% assumed consistency
    }
  }

  // Challenge bonus (small additional reduction per active challenge)
  const challengeOffset = activeChallenges * 0.3;

  // 5. Generate daily forecast points
  const dailyForecasts: ForecastPoint[] = [];
  const stdDev = calculateStdDev(recent30);

  for (let day = 1; day <= 30; day++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(forecastDate.getDate() + day);

    // Base prediction: weighted average + trend component - habit offset
    const basePrediction = Math.max(
      0,
      weightedAvg + slope * day - dailyHabitOffset - challengeOffset
    );

    // Confidence interval widens with time
    const widthFactor = 1 + (day / 30) * 0.5;
    const confidenceRange = stdDev * 1.96 * widthFactor;

    dailyForecasts.push({
      date: forecastDate.toISOString().split("T")[0]!,
      predictedCo2: Math.round(basePrediction * 100) / 100,
      confidenceLow: Math.max(
        0,
        Math.round((basePrediction - confidenceRange) * 100) / 100
      ),
      confidenceHigh: Math.round(
        (basePrediction + confidenceRange) * 100
      ) / 100,
    });
  }

  // Projected monthly total
  const projectedMonthly = dailyForecasts.reduce(
    (sum, d) => sum + d.predictedCo2,
    0
  );

  // Influencing factors
  const factors: string[] = [];
  if (uniqueHabits.size > 0) {
    factors.push(
      `${uniqueHabits.size} active habits reducing ~${dailyHabitOffset.toFixed(1)} kg/day`
    );
  }
  if (activeChallenges > 0) {
    factors.push(`${activeChallenges} active challenge(s)`);
  }
  if (trend === "decreasing") {
    factors.push("Downward trend in recent emissions");
  } else if (trend === "increasing") {
    factors.push("Upward trend in recent emissions");
  }
  if (factors.length === 0) {
    factors.push("Based on historical emission patterns");
  }

  return {
    projectedMonthly: Math.round(projectedMonthly * 100) / 100,
    trend,
    trendPct,
    dailyForecasts,
    factors,
  };
}

/**
 * Simple linear regression on an array of values.
 * Returns slope and average y value.
 */
function linearRegression(values: number[]): {
  slope: number;
  avgY: number;
} {
  const n = values.length;
  if (n === 0) return { slope: 0, avgY: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i]!;
    sumXY += i * values[i]!;
    sumXX += i * i;
  }

  const avgY = sumY / n;
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;

  return { slope, avgY };
}

/**
 * Calculate standard deviation of an array of numbers.
 */
function calculateStdDev(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const squareDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squareDiffs.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(variance);
}
