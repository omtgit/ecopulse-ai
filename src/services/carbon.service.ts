import prisma from "@/lib/prisma";
import {
  EMISSION_FACTORS,
  NATIONAL_AVERAGE_MONTHLY_CO2,
  CATEGORY_COLORS,
  getEmissionFactor,
} from "@/constants/emission-factors";
import { formatMonthYear, percentageChange } from "@/lib/utils";
import type {
  CarbonEntryInput,
  CarbonEntryResult,
  CarbonSummary,
  CategoryBreakdown,
  TrendDataPoint,
  CalculatorFormData,
  CarbonCategoryType,
} from "@/types/carbon.types";
import type { DashboardData } from "@/types/api.types";

const CARBON_CATEGORIES: CarbonCategoryType[] = [
  "TRANSPORT",
  "ELECTRICITY",
  "FOOD",
  "SHOPPING",
  "WASTE",
];

/**
 * Calculate CO2 emissions from a list of carbon entry inputs using emission factors.
 * This is a pure function that does not persist data.
 *
 * @param entries - Array of carbon entry inputs with category, subcategory, and value
 * @returns Array of calculated carbon entry results with co2Kg computed
 */
export function calculateFootprint(
  entries: CarbonEntryInput[]
): CarbonEntryResult[] {
  return entries.map((entry) => {
    const factor = getEmissionFactor(entry.category, entry.subcategory);
    const co2Kg = factor ? entry.value * factor.factor : 0;
    const entryDate = entry.date ? new Date(entry.date) : new Date();

    return {
      ...entry,
      co2Kg: Math.round(co2Kg * 100) / 100,
      month: entryDate.getMonth() + 1,
      year: entryDate.getFullYear(),
    };
  });
}

/**
 * Calculate footprint from the unified calculator form.
 * Converts the structured form data into individual carbon entries and calculates totals.
 *
 * @param formData - Structured calculator form data
 * @returns Array of calculated carbon entry results
 */
export function calculateFromForm(
  formData: CalculatorFormData
): CarbonEntryResult[] {
  const entries: CarbonEntryInput[] = [];

  // Transport entries
  if (formData.transport.carKm > 0) {
    entries.push({
      category: "TRANSPORT",
      subcategory: `car_${formData.transport.carType}`,
      value: formData.transport.carKm,
      unit: "km",
    });
  }
  if (formData.transport.busKm > 0) {
    entries.push({
      category: "TRANSPORT",
      subcategory: "bus",
      value: formData.transport.busKm,
      unit: "km",
    });
  }
  if (formData.transport.trainKm > 0) {
    entries.push({
      category: "TRANSPORT",
      subcategory: "train",
      value: formData.transport.trainKm,
      unit: "km",
    });
  }
  if (formData.transport.flightKm > 0) {
    entries.push({
      category: "TRANSPORT",
      subcategory: "flight_domestic",
      value: formData.transport.flightKm,
      unit: "km",
    });
  }
  if (formData.transport.bikeKm > 0) {
    entries.push({
      category: "TRANSPORT",
      subcategory: "bike",
      value: formData.transport.bikeKm,
      unit: "km",
    });
  }

  // Electricity
  if (formData.electricity.kwhPerMonth > 0) {
    entries.push({
      category: "ELECTRICITY",
      subcategory: "grid_average",
      value: formData.electricity.kwhPerMonth,
      unit: "kWh",
    });
  }

  // Food (mealsPerDay * 30 days = monthly meals)
  const monthlyMeals = formData.food.mealsPerDay * 30;
  if (monthlyMeals > 0) {
    entries.push({
      category: "FOOD",
      subcategory: formData.food.dietType,
      value: monthlyMeals,
      unit: "meals",
    });
  }

  // Shopping
  if (formData.shopping.clothingItems > 0) {
    entries.push({
      category: "SHOPPING",
      subcategory: "clothing",
      value: formData.shopping.clothingItems,
      unit: "items",
    });
  }
  if (formData.shopping.electronicsItems > 0) {
    entries.push({
      category: "SHOPPING",
      subcategory: "electronics",
      value: formData.shopping.electronicsItems,
      unit: "items",
    });
  }
  if (formData.shopping.generalItems > 0) {
    entries.push({
      category: "SHOPPING",
      subcategory: "general",
      value: formData.shopping.generalItems,
      unit: "items",
    });
  }

  // Waste
  if (formData.waste.landfillKg > 0) {
    entries.push({
      category: "WASTE",
      subcategory: "landfill",
      value: formData.waste.landfillKg,
      unit: "kg",
    });
  }
  if (formData.waste.recycledKg > 0) {
    entries.push({
      category: "WASTE",
      subcategory: "recycled",
      value: formData.waste.recycledKg,
      unit: "kg",
    });
  }
  if (formData.waste.compostedKg > 0) {
    entries.push({
      category: "WASTE",
      subcategory: "composted",
      value: formData.waste.compostedKg,
      unit: "kg",
    });
  }

  return calculateFootprint(entries);
}

/**
 * Save calculated carbon entries to the database within a transaction.
 *
 * @param userId - The authenticated user's ID
 * @param entries - Calculated carbon entry results
 * @returns Array of created database records
 */
export async function saveEntries(
  userId: string,
  entries: CarbonEntryResult[]
) {
  return prisma.$transaction(
    entries.map((entry) =>
      prisma.carbonEntry.create({
        data: {
          userId,
          category: entry.category,
          subcategory: entry.subcategory,
          value: entry.value,
          unit: entry.unit,
          co2Kg: entry.co2Kg,
          date: entry.date ? new Date(entry.date) : new Date(),
          month: entry.month,
          year: entry.year,
          notes: entry.notes,
        },
      })
    )
  );
}

/**
 * Get aggregated monthly CO2 total for a user.
 *
 * @param userId - The authenticated user's ID
 * @param month - Month number (1-12)
 * @param year - Four-digit year
 * @returns Total CO2 in kg for the month
 */
export async function getMonthlyTotal(
  userId: string,
  month: number,
  year: number
): Promise<number> {
  const result = await prisma.carbonEntry.aggregate({
    where: { userId, month, year },
    _sum: { co2Kg: true },
  });
  return result._sum.co2Kg ?? 0;
}

/**
 * Get CO2 breakdown grouped by category for a given month.
 *
 * @param userId - The authenticated user's ID
 * @param month - Month number (1-12)
 * @param year - Four-digit year
 * @returns Array of category breakdowns with totals and percentages
 */
export async function getCategoryBreakdown(
  userId: string,
  month: number,
  year: number
): Promise<CategoryBreakdown[]> {
  const groups = await prisma.carbonEntry.groupBy({
    by: ["category"],
    where: { userId, month, year },
    _sum: { co2Kg: true },
    _count: { id: true },
  });

  const totalCo2 = groups.reduce((sum, g) => sum + (g._sum.co2Kg ?? 0), 0);

  return groups.map((g) => ({
    category: g.category as CarbonCategoryType,
    co2Kg: g._sum.co2Kg ?? 0,
    percentage: totalCo2 > 0 ? ((g._sum.co2Kg ?? 0) / totalCo2) * 100 : 0,
    entries: g._count.id,
  }));
}

/**
 * Get historical trend data for the last N months.
 *
 * @param userId - The authenticated user's ID
 * @param monthsBack - Number of months to look back (default 6)
 * @returns Array of trend data points ordered chronologically
 */
export async function getTrendData(
  userId: string,
  monthsBack: number = 6
): Promise<TrendDataPoint[]> {
  const now = new Date();
  const points: TrendDataPoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    const groups = await prisma.carbonEntry.groupBy({
      by: ["category"],
      where: { userId, month: m, year: y },
      _sum: { co2Kg: true },
    });

    const categoryMap: Record<string, number> = {};
    for (const cat of CARBON_CATEGORIES) {
      categoryMap[cat] = 0;
    }
    let totalCo2 = 0;
    for (const g of groups) {
      categoryMap[g.category] = g._sum.co2Kg ?? 0;
      totalCo2 += g._sum.co2Kg ?? 0;
    }

    points.push({
      month: m,
      year: y,
      label: formatMonthYear(m, y),
      totalCo2,
      transport: categoryMap["TRANSPORT"] ?? 0,
      electricity: categoryMap["ELECTRICITY"] ?? 0,
      food: categoryMap["FOOD"] ?? 0,
      shopping: categoryMap["SHOPPING"] ?? 0,
      waste: categoryMap["WASTE"] ?? 0,
    });
  }

  return points;
}

/**
 * Compare the user's current monthly footprint against the national average.
 *
 * @param userId - The authenticated user's ID
 * @returns Percentage difference (negative means below average = better)
 */
export async function compareWithAverage(userId: string): Promise<number> {
  const now = new Date();
  const currentTotal = await getMonthlyTotal(
    userId,
    now.getMonth() + 1,
    now.getFullYear()
  );
  return percentageChange(currentTotal, NATIONAL_AVERAGE_MONTHLY_CO2);
}

/**
 * Get a full carbon summary for a given month.
 *
 * @param userId - The authenticated user's ID
 * @param month - Month number (1-12)
 * @param year - Four-digit year
 * @returns Complete carbon summary with breakdown and comparison data
 */
export async function getMonthlySummary(
  userId: string,
  month: number,
  year: number
): Promise<CarbonSummary> {
  const [totalCo2Kg, categoryBreakdown] = await Promise.all([
    getMonthlyTotal(userId, month, year),
    getCategoryBreakdown(userId, month, year),
  ]);

  // Get previous month data for comparison
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevTotal = await getMonthlyTotal(userId, prevMonth, prevYear);

  return {
    totalCo2Kg,
    categoryBreakdown,
    comparisonWithAverage: percentageChange(
      totalCo2Kg,
      NATIONAL_AVERAGE_MONTHLY_CO2
    ),
    reductionFromLastMonth: percentageChange(totalCo2Kg, prevTotal),
    month,
    year,
  };
}

/**
 * Get combined dashboard data for the user's home screen.
 * Aggregates current and previous month footprints, trends, habits, challenges, and badges.
 *
 * @param userId - The authenticated user's ID
 * @returns Complete dashboard data object
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [
    monthlyFootprint,
    previousMonthFootprint,
    categoryBreakdown,
    trendData,
    activeHabitsCount,
    activeChallengesCount,
    recentBadges,
    user,
  ] = await Promise.all([
    getMonthlyTotal(userId, currentMonth, currentYear),
    getMonthlyTotal(userId, prevMonth, prevYear),
    getCategoryBreakdown(userId, currentMonth, currentYear),
    getTrendData(userId, 6),
    prisma.habitLog.count({
      where: {
        userId,
        completed: true,
        date: { gte: new Date(currentYear, currentMonth - 1, 1) },
      },
    }),
    prisma.userChallenge.count({
      where: { userId, status: "ACTIVE" },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
      take: 3,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    }),
  ]);

  // Calculate current streak from habit logs
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(today);

  while (true) {
    const logsOnDate = await prisma.habitLog.count({
      where: {
        userId,
        completed: true,
        date: checkDate,
      },
    });
    if (logsOnDate === 0) break;
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    monthlyFootprint,
    previousMonthFootprint,
    reductionPct: percentageChange(monthlyFootprint, previousMonthFootprint),
    categoryBreakdown: categoryBreakdown.map((cb) => ({
      category: cb.category,
      co2Kg: cb.co2Kg,
      color: CATEGORY_COLORS[cb.category] ?? "#6b7280",
    })),
    trendData: trendData.map((td) => ({
      label: td.label,
      co2: td.totalCo2,
    })),
    currentStreak,
    activeHabits: activeHabitsCount,
    activeChallenges: activeChallengesCount,
    totalPointsThisMonth: user?.totalPoints ?? 0,
    comparisonWithAverage: percentageChange(
      monthlyFootprint,
      NATIONAL_AVERAGE_MONTHLY_CO2
    ),
    recentBadges: recentBadges.map((ub) => ({
      name: ub.badge.name,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt.toISOString(),
    })),
  };
}
