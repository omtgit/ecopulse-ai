import prisma from "@/lib/prisma";
import type {
  ChallengeData,
  UserChallengeData,
  BadgeData,
  ChallengeStatusType,
} from "@/types/habit.types";

/**
 * Get all active challenges available for users to join.
 *
 * @returns Array of active challenge definitions
 */
export async function getAvailableChallenges(): Promise<ChallengeData[]> {
  const challenges = await prisma.challenge.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return challenges.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    pointsReward: c.pointsReward,
    durationDays: c.durationDays,
    badgeIcon: c.badgeIcon,
    difficulty: c.difficulty,
    isActive: c.isActive,
  }));
}

/**
 * Join a challenge. Creates a UserChallenge record with calculated end date.
 * Prevents duplicate active enrollments in the same challenge.
 *
 * @param userId - The authenticated user's ID
 * @param challengeId - The challenge to join
 * @returns The created user challenge record
 * @throws Error if challenge not found or already enrolled
 */
export async function joinChallenge(
  userId: string,
  challengeId: string
) {
  // Check if challenge exists
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  if (!challenge.isActive) {
    throw new Error("This challenge is no longer active");
  }

  // Check for existing active enrollment
  const existing = await prisma.userChallenge.findFirst({
    where: {
      userId,
      challengeId,
      status: "ACTIVE",
    },
  });

  if (existing) {
    throw new Error("You are already enrolled in this challenge");
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + challenge.durationDays);

  return prisma.userChallenge.create({
    data: {
      userId,
      challengeId,
      startDate,
      endDate,
      status: "ACTIVE",
      progress: 0,
    },
    include: { challenge: true },
  });
}

/**
 * Update progress on a user's active challenge.
 * Auto-completes the challenge and awards points when progress reaches 100.
 *
 * @param userId - The authenticated user's ID
 * @param challengeId - The challenge to update progress for
 * @param progress - New progress value (0-100)
 * @returns The updated user challenge record
 * @throws Error if challenge enrollment not found
 */
export async function updateProgress(
  userId: string,
  challengeId: string,
  progress: number
) {
  const userChallenge = await prisma.userChallenge.findFirst({
    where: {
      userId,
      challengeId,
      status: "ACTIVE",
    },
    include: { challenge: true },
  });

  if (!userChallenge) {
    throw new Error("Active challenge enrollment not found");
  }

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isCompleted = clampedProgress >= 100;

  if (isCompleted) {
    // Complete challenge and award points in a transaction
    const [updatedChallenge] = await prisma.$transaction([
      prisma.userChallenge.update({
        where: { id: userChallenge.id },
        data: {
          progress: 100,
          status: "COMPLETED",
          completedAt: new Date(),
        },
        include: { challenge: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: userChallenge.challenge.pointsReward },
        },
      }),
    ]);

    return updatedChallenge;
  }

  return prisma.userChallenge.update({
    where: { id: userChallenge.id },
    data: { progress: clampedProgress },
    include: { challenge: true },
  });
}

/**
 * Get all challenges for a user (active, completed, failed, abandoned).
 *
 * @param userId - The authenticated user's ID
 * @param status - Optional status filter
 * @returns Array of user challenge records with challenge details
 */
export async function getUserChallenges(
  userId: string,
  status?: ChallengeStatusType
): Promise<UserChallengeData[]> {
  const where: Record<string, unknown> = { userId };
  if (status) {
    where["status"] = status;
  }

  const userChallenges = await prisma.userChallenge.findMany({
    where,
    include: { challenge: true },
    orderBy: { startDate: "desc" },
  });

  return userChallenges.map((uc) => ({
    id: uc.id,
    challenge: {
      id: uc.challenge.id,
      title: uc.challenge.title,
      description: uc.challenge.description,
      category: uc.challenge.category,
      pointsReward: uc.challenge.pointsReward,
      durationDays: uc.challenge.durationDays,
      badgeIcon: uc.challenge.badgeIcon,
      difficulty: uc.challenge.difficulty,
      isActive: uc.challenge.isActive,
    },
    startDate: uc.startDate.toISOString(),
    endDate: uc.endDate.toISOString(),
    status: uc.status as ChallengeStatusType,
    progress: uc.progress,
    completedAt: uc.completedAt?.toISOString(),
  }));
}

/**
 * Get a single challenge with user enrollment info.
 *
 * @param challengeId - The challenge ID
 * @param userId - The authenticated user's ID
 * @returns Challenge data with optional user enrollment
 */
export async function getChallengeDetails(
  challengeId: string,
  userId: string
) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      userChallenges: {
        where: { userId },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  return {
    challenge: {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      pointsReward: challenge.pointsReward,
      durationDays: challenge.durationDays,
      badgeIcon: challenge.badgeIcon,
      difficulty: challenge.difficulty,
      isActive: challenge.isActive,
    },
    userEnrollment: challenge.userChallenges[0]
      ? {
          id: challenge.userChallenges[0].id,
          startDate: challenge.userChallenges[0].startDate.toISOString(),
          endDate: challenge.userChallenges[0].endDate.toISOString(),
          status: challenge.userChallenges[0].status as ChallengeStatusType,
          progress: challenge.userChallenges[0].progress,
          completedAt:
            challenge.userChallenges[0].completedAt?.toISOString(),
        }
      : null,
  };
}

/**
 * Check badge criteria and award any newly earned badges.
 * Evaluates points thresholds, challenge completions, habit streaks, and footprint reductions.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of newly awarded badge names
 */
export async function checkAndAwardBadges(
  userId: string
): Promise<string[]> {
  const [user, completedChallenges, existingBadges, allBadges, habitLogs] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.userChallenge.count({
        where: { userId, status: "COMPLETED" },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      }),
      prisma.badge.findMany(),
      prisma.habitLog.findMany({
        where: { userId, completed: true },
        orderBy: { date: "desc" },
        select: { date: true },
      }),
    ]);

  if (!user) return [];

  const earnedBadgeIds = new Set(existingBadges.map((b) => b.badgeId));
  const newlyAwarded: string[] = [];

  // Calculate longest streak across all habits
  let maxStreak = 0;
  if (habitLogs.length > 0) {
    const dates = [
      ...new Set(
        habitLogs.map((l) => {
          const d = new Date(l.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      ),
    ].sort((a, b) => a - b);

    let streak = 1;
    const oneDay = 24 * 60 * 60 * 1000;
    for (let i = 1; i < dates.length; i++) {
      if ((dates[i]! - dates[i - 1]!) === oneDay) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, streak);
  }

  // Check carbon calculation badge (has any entries)
  const hasEntries =
    (await prisma.carbonEntry.count({ where: { userId } })) > 0;

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let earned = false;

    // Points-based badges
    if (
      badge.criteria.includes("total points") &&
      user.totalPoints >= badge.pointsRequired
    ) {
      earned = true;
    }

    // Challenge-based badges
    if (
      badge.criteria.includes("Complete 5 challenges") &&
      completedChallenges >= 5
    ) {
      earned = true;
    }

    // First carbon calculation
    if (
      badge.criteria.includes("first carbon calculation") &&
      hasEntries
    ) {
      earned = true;
    }

    // Streak-based badges
    if (badge.criteria.includes("7-day habit streak") && maxStreak >= 7) {
      earned = true;
    }
    if (badge.criteria.includes("30-day habit streak") && maxStreak >= 30) {
      earned = true;
    }

    // Monthly reduction badges (check last two months)
    if (badge.criteria.includes("monthly reduction")) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const [currentTotal, prevTotal] = await Promise.all([
        prisma.carbonEntry.aggregate({
          where: { userId, month: currentMonth, year: currentYear },
          _sum: { co2Kg: true },
        }),
        prisma.carbonEntry.aggregate({
          where: { userId, month: prevMonth, year: prevYear },
          _sum: { co2Kg: true },
        }),
      ]);

      const curr = currentTotal._sum.co2Kg ?? 0;
      const prev = prevTotal._sum.co2Kg ?? 0;

      if (prev > 0) {
        const reductionPct = ((prev - curr) / prev) * 100;
        if (
          badge.criteria.includes("10%") &&
          reductionPct >= 10
        ) {
          earned = true;
        }
        if (
          badge.criteria.includes("25%") &&
          reductionPct >= 25
        ) {
          earned = true;
        }
      }
    }

    // Net-zero badge
    if (badge.criteria.includes("Net-zero")) {
      const now = new Date();
      const total = await prisma.carbonEntry.aggregate({
        where: {
          userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        _sum: { co2Kg: true },
      });
      if ((total._sum.co2Kg ?? 0) === 0 && hasEntries) {
        earned = true;
      }
    }

    if (earned) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      newlyAwarded.push(badge.name);
    }
  }

  return newlyAwarded;
}

/**
 * Get all badges with earned status for a user.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of badge data with earned flag and timestamp
 */
export async function getUserBadges(userId: string): Promise<BadgeData[]> {
  const [allBadges, userBadges] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, earnedAt: true },
    }),
  ]);

  const earnedMap = new Map(
    userBadges.map((ub) => [ub.badgeId, ub.earnedAt])
  );

  return allBadges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    criteria: badge.criteria,
    pointsRequired: badge.pointsRequired,
    earned: earnedMap.has(badge.id),
    earnedAt: earnedMap.get(badge.id)?.toISOString(),
  }));
}
