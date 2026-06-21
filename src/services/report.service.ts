import prisma from "@/lib/prisma";
import { getMonthlyTotal, getCategoryBreakdown } from "@/services/carbon.service";
import type { WeeklyReportData } from "@/types/api.types";

/**
 * Generate a weekly report for the user, compiling the past week's data
 * including CO2 totals, category breakdowns, habits, challenges, and highlights.
 *
 * @param userId - The authenticated user's ID
 * @returns The generated weekly report data and the persisted record
 */
export async function generateWeeklyReport(userId: string) {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // Get carbon entries for the week
  const weekEntries = await prisma.carbonEntry.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
  });

  const totalCo2 = weekEntries.reduce((sum, e) => sum + e.co2Kg, 0);

  // Category breakdown for the week
  const categoryMap = new Map<string, number>();
  for (const entry of weekEntries) {
    categoryMap.set(
      entry.category,
      (categoryMap.get(entry.category) ?? 0) + entry.co2Kg
    );
  }

  const categoryData = Array.from(categoryMap.entries()).map(
    ([category, co2Kg]) => ({
      category,
      co2Kg: Math.round(co2Kg * 100) / 100,
      percentage: totalCo2 > 0 ? Math.round((co2Kg / totalCo2) * 100) : 0,
    })
  );

  // Get previous week's total for comparison
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEntries = await prisma.carbonEntry.aggregate({
    where: {
      userId,
      date: { gte: prevWeekStart, lt: weekStart },
    },
    _sum: { co2Kg: true },
  });
  const prevWeekTotal = prevWeekEntries._sum.co2Kg ?? 0;
  const reductionPct =
    prevWeekTotal > 0
      ? Math.round(((prevWeekTotal - totalCo2) / prevWeekTotal) * 100 * 10) /
        10
      : 0;

  // Habit stats
  const habitsCompleted = await prisma.habitLog.count({
    where: {
      userId,
      completed: true,
      date: { gte: weekStart, lte: weekEnd },
    },
  });

  // Challenge stats
  const challengesCompleted = await prisma.userChallenge.count({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: { gte: weekStart, lte: weekEnd },
    },
  });

  // Points earned this week
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, totalPoints: true },
  });

  // Generate highlights
  const highlights: string[] = [];
  if (reductionPct > 0) {
    highlights.push(
      `Reduced emissions by ${reductionPct}% compared to last week`
    );
  }
  if (habitsCompleted > 0) {
    highlights.push(`Completed ${habitsCompleted} eco habits`);
  }
  if (challengesCompleted > 0) {
    highlights.push(
      `Finished ${challengesCompleted} challenge${challengesCompleted > 1 ? "s" : ""}`
    );
  }

  const topCategory = categoryData.sort((a, b) => b.co2Kg - a.co2Kg)[0];
  if (topCategory) {
    highlights.push(
      `${topCategory.category} was your highest emission category at ${topCategory.co2Kg.toFixed(1)} kg`
    );
  }

  if (highlights.length === 0) {
    highlights.push("Keep logging your activities to see weekly insights!");
  }

  // Persist the report
  const report = await prisma.weeklyReport.create({
    data: {
      userId,
      weekStart,
      weekEnd,
      totalCo2: Math.round(totalCo2 * 100) / 100,
      reductionPct,
      highlights: highlights,
      categoryData: categoryData,
    },
  });

  const reportData: WeeklyReportData = {
    id: report.id,
    userName: user?.name ?? "User",
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalCo2: report.totalCo2,
    reductionPct: report.reductionPct,
    highlights,
    categoryData,
    habitsCompleted,
    challengesCompleted,
    pointsEarned: user?.totalPoints ?? 0,
    aiRecommendations: [],
    generatedAt: report.generatedAt.toISOString(),
  };

  return reportData;
}

/**
 * Get the history of generated weekly reports for a user.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of past weekly reports, most recent first
 */
export async function getReportHistory(userId: string) {
  const reports = await prisma.weeklyReport.findMany({
    where: { userId },
    orderBy: { generatedAt: "desc" },
    take: 20,
  });

  return reports.map((r) => ({
    id: r.id,
    weekStart: r.weekStart.toISOString(),
    weekEnd: r.weekEnd.toISOString(),
    totalCo2: r.totalCo2,
    reductionPct: r.reductionPct,
    generatedAt: r.generatedAt.toISOString(),
  }));
}

/**
 * Get a specific report by ID, verifying ownership.
 *
 * @param reportId - The report ID to retrieve
 * @param userId - The authenticated user's ID (for ownership check)
 * @returns The full weekly report data
 * @throws Error if report not found or user doesn't own it
 */
export async function getReportById(
  reportId: string,
  userId: string
): Promise<WeeklyReportData> {
  const report = await prisma.weeklyReport.findUnique({
    where: { id: reportId },
    include: {
      user: { select: { name: true, totalPoints: true } },
    },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.userId !== userId) {
    throw new Error("Not authorized to view this report");
  }

  return {
    id: report.id,
    userName: report.user.name ?? "User",
    weekStart: report.weekStart.toISOString(),
    weekEnd: report.weekEnd.toISOString(),
    totalCo2: report.totalCo2,
    reductionPct: report.reductionPct,
    highlights: report.highlights as string[],
    categoryData: report.categoryData as {
      category: string;
      co2Kg: number;
      percentage: number;
    }[],
    habitsCompleted: 0, // Historical count not stored, would need re-query
    challengesCompleted: 0,
    pointsEarned: report.user.totalPoints,
    aiRecommendations: [],
    generatedAt: report.generatedAt.toISOString(),
  };
}
