import prisma from "@/lib/prisma";
import type { LeaderboardEntry } from "@/types/habit.types";
import type { PaginatedResponse } from "@/types/api.types";

/**
 * Get the global leaderboard sorted by total points (descending).
 * Includes user rank, name, points, reduction percentage, and badge count.
 *
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of entries per page
 * @returns Paginated leaderboard entries
 */
export async function getGlobalLeaderboard(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<LeaderboardEntry>> {
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { totalPoints: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        image: true,
        totalPoints: true,
        _count: {
          select: { userBadges: true },
        },
      },
    }),
    prisma.user.count(),
  ]);

  // Calculate reduction percentage for each user
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const items: LeaderboardEntry[] = await Promise.all(
    users.map(async (user, index) => {
      const [currentTotal, prevTotal] = await Promise.all([
        prisma.carbonEntry.aggregate({
          where: { userId: user.id, month: currentMonth, year: currentYear },
          _sum: { co2Kg: true },
        }),
        prisma.carbonEntry.aggregate({
          where: { userId: user.id, month: prevMonth, year: prevYear },
          _sum: { co2Kg: true },
        }),
      ]);

      const curr = currentTotal._sum.co2Kg ?? 0;
      const prev = prevTotal._sum.co2Kg ?? 0;
      const reductionPct =
        prev > 0
          ? Math.round(((prev - curr) / prev) * 100 * 10) / 10
          : 0;

      return {
        rank: skip + index + 1,
        userId: user.id,
        name: user.name ?? "Anonymous",
        image: user.image ?? undefined,
        totalPoints: user.totalPoints,
        reductionPct,
        badges: user._count.userBadges,
      };
    })
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasMore: skip + pageSize < total,
  };
}

/**
 * Get a specific user's rank on the global leaderboard.
 *
 * @param userId - The authenticated user's ID
 * @returns The user's rank (1-indexed) and total points
 */
export async function getUserRank(
  userId: string
): Promise<{ rank: number; totalPoints: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Count users with more points (they rank higher)
  const usersAbove = await prisma.user.count({
    where: { totalPoints: { gt: user.totalPoints } },
  });

  return {
    rank: usersAbove + 1,
    totalPoints: user.totalPoints,
  };
}

/**
 * Get the monthly leaderboard for a specific month.
 * Rankings are based on CO2 reduction percentage month-over-month.
 *
 * @param month - Month number (1-12)
 * @param year - Four-digit year
 * @returns Array of leaderboard entries ranked by reduction percentage
 */
export async function getMonthlyLeaderboard(
  month: number,
  year: number
): Promise<LeaderboardEntry[]> {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  // Get all users who have entries in the specified month
  const usersWithEntries = await prisma.carbonEntry.findMany({
    where: { month, year },
    distinct: ["userId"],
    select: { userId: true },
  });

  const entries: LeaderboardEntry[] = await Promise.all(
    usersWithEntries.map(async (entry) => {
      const [user, currentTotal, prevTotal, badgeCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id: entry.userId },
          select: { name: true, image: true, totalPoints: true },
        }),
        prisma.carbonEntry.aggregate({
          where: { userId: entry.userId, month, year },
          _sum: { co2Kg: true },
        }),
        prisma.carbonEntry.aggregate({
          where: { userId: entry.userId, month: prevMonth, year: prevYear },
          _sum: { co2Kg: true },
        }),
        prisma.userBadge.count({ where: { userId: entry.userId } }),
      ]);

      const curr = currentTotal._sum.co2Kg ?? 0;
      const prev = prevTotal._sum.co2Kg ?? 0;
      const reductionPct =
        prev > 0
          ? Math.round(((prev - curr) / prev) * 100 * 10) / 10
          : 0;

      return {
        rank: 0, // Will be assigned after sorting
        userId: entry.userId,
        name: user?.name ?? "Anonymous",
        image: user?.image ?? undefined,
        totalPoints: user?.totalPoints ?? 0,
        reductionPct,
        badges: badgeCount,
      };
    })
  );

  // Sort by reduction percentage (higher = better) and assign ranks
  entries.sort((a, b) => b.reductionPct - a.reductionPct);
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
}
