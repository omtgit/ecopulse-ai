import prisma from "@/lib/prisma";
import { HABIT_DEFINITIONS } from "@/constants/challenges";
import type {
  HabitTypeKey,
  HabitLogEntry,
  HabitStreak,
  HabitImpactSummary,
  DailyCheckIn,
} from "@/types/habit.types";

/**
 * Log or update a single habit entry for a user on a specific date.
 * Uses upsert to handle idempotent daily check-ins.
 *
 * @param userId - The authenticated user's ID
 * @param habitType - The type of habit being logged
 * @param completed - Whether the habit was completed
 * @param date - The date string in YYYY-MM-DD format
 * @param notes - Optional notes about the habit completion
 * @returns The created or updated habit log entry
 */
export async function logHabit(
  userId: string,
  habitType: HabitTypeKey,
  completed: boolean,
  date: string,
  notes?: string
) {
  const habitDef = HABIT_DEFINITIONS.find((h) => h.type === habitType);
  const impactKg = completed && habitDef ? habitDef.impactKgPerDay : 0;
  const dateObj = new Date(date + "T00:00:00.000Z");

  return prisma.habitLog.upsert({
    where: {
      userId_habitType_date: {
        userId,
        habitType,
        date: dateObj,
      },
    },
    create: {
      userId,
      habitType,
      completed,
      date: dateObj,
      impactKg,
      notes,
    },
    update: {
      completed,
      impactKg,
      notes,
    },
  });
}

/**
 * Batch log multiple habits for a single day (daily check-in).
 * Wraps all upserts in a transaction for atomicity.
 *
 * @param userId - The authenticated user's ID
 * @param dailyCheckIn - Object containing the date and array of habit statuses
 * @returns Array of created/updated habit log records
 */
export async function bulkLogHabits(
  userId: string,
  dailyCheckIn: DailyCheckIn
) {
  const operations = dailyCheckIn.habits.map((habit) => {
    const habitDef = HABIT_DEFINITIONS.find((h) => h.type === habit.habitType);
    const impactKg =
      habit.completed && habitDef ? habitDef.impactKgPerDay : 0;
    const dateObj = new Date(dailyCheckIn.date + "T00:00:00.000Z");

    return prisma.habitLog.upsert({
      where: {
        userId_habitType_date: {
          userId,
          habitType: habit.habitType,
          date: dateObj,
        },
      },
      create: {
        userId,
        habitType: habit.habitType,
        completed: habit.completed,
        date: dateObj,
        impactKg,
        notes: habit.notes,
      },
      update: {
        completed: habit.completed,
        impactKg,
        notes: habit.notes,
      },
    });
  });

  return prisma.$transaction(operations);
}

/**
 * Calculate the current and longest streaks for a specific habit type.
 * A streak is a consecutive run of days where the habit was completed.
 *
 * @param userId - The authenticated user's ID
 * @param habitType - The habit type to calculate streak for
 * @returns Streak data including current, longest, and total days
 */
export async function getHabitStreak(
  userId: string,
  habitType: HabitTypeKey
): Promise<HabitStreak> {
  const logs = await prisma.habitLog.findMany({
    where: { userId, habitType, completed: true },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (logs.length === 0) {
    return {
      habitType,
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastCompletedDate: null,
    };
  }

  const dates = logs.map((l) => {
    const d = new Date(l.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  // Calculate current streak (from today backwards)
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkDate = today.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  // Allow today or yesterday as the start of a current streak
  if (dates.includes(checkDate)) {
    currentStreak = 1;
    checkDate -= oneDay;
    while (dates.includes(checkDate)) {
      currentStreak++;
      checkDate -= oneDay;
    }
  } else if (dates.includes(checkDate - oneDay)) {
    // Yesterday counts as current if today isn't over
    checkDate -= oneDay;
    currentStreak = 1;
    checkDate -= oneDay;
    while (dates.includes(checkDate)) {
      currentStreak++;
      checkDate -= oneDay;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDates = [...new Set(dates)].sort((a, b) => a - b);

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = (sortedDates[i]! - sortedDates[i - 1]!) / oneDay;
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    habitType,
    currentStreak,
    longestStreak,
    totalDays: sortedDates.length,
    lastCompletedDate: logs[0] ? new Date(logs[0].date).toISOString() : null,
  };
}

/**
 * Get streaks for all habit types at once.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of streak data for every habit type
 */
export async function getAllStreaks(userId: string): Promise<HabitStreak[]> {
  const habitTypes: HabitTypeKey[] = HABIT_DEFINITIONS.map((h) => h.type);
  return Promise.all(
    habitTypes.map((ht) => getHabitStreak(userId, ht))
  );
}

/**
 * Calculate the total CO2 impact from completed habits over a period.
 *
 * @param userId - The authenticated user's ID
 * @param days - Number of days to look back (default 30)
 * @returns Impact summary with totals and per-habit breakdowns
 */
export async function getHabitImpact(
  userId: string,
  days: number = 30
): Promise<HabitImpactSummary> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const groups = await prisma.habitLog.groupBy({
    by: ["habitType"],
    where: {
      userId,
      completed: true,
      date: { gte: since },
    },
    _sum: { impactKg: true },
    _count: { id: true },
  });

  const totalCo2SavedKg = groups.reduce(
    (sum, g) => sum + (g._sum.impactKg ?? 0),
    0
  );

  const habitBreakdown = groups.map((g) => {
    const def = HABIT_DEFINITIONS.find((h) => h.type === g.habitType);
    return {
      habitType: g.habitType as HabitTypeKey,
      label: def?.label ?? g.habitType,
      daysCompleted: g._count.id,
      co2SavedKg: g._sum.impactKg ?? 0,
    };
  });

  const weeklyAverage = days >= 7 ? (totalCo2SavedKg / days) * 7 : totalCo2SavedKg;
  const monthlyProjection = (totalCo2SavedKg / days) * 30;

  return {
    totalCo2SavedKg: Math.round(totalCo2SavedKg * 100) / 100,
    habitBreakdown,
    weeklyAverage: Math.round(weeklyAverage * 100) / 100,
    monthlyProjection: Math.round(monthlyProjection * 100) / 100,
  };
}

/**
 * Get habit log data formatted for calendar display for a given month.
 *
 * @param userId - The authenticated user's ID
 * @param month - Month number (1-12)
 * @param year - Four-digit year
 * @returns Map of date strings to arrays of habit log entries
 */
export async function getHabitCalendar(
  userId: string,
  month: number,
  year: number
): Promise<Record<string, HabitLogEntry[]>> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  const logs = await prisma.habitLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });

  const calendar: Record<string, HabitLogEntry[]> = {};

  for (const log of logs) {
    const dateKey = new Date(log.date).toISOString().split("T")[0]!;
    if (!calendar[dateKey]) {
      calendar[dateKey] = [];
    }
    calendar[dateKey]!.push({
      id: log.id,
      habitType: log.habitType as HabitTypeKey,
      completed: log.completed,
      date: dateKey,
      impactKg: log.impactKg,
      notes: log.notes ?? undefined,
    });
  }

  return calendar;
}

/**
 * Get habit logs for a specific month (flat list).
 *
 * @param userId - The authenticated user's ID
 * @param month - Month number (1-12)
 * @param year - Four-digit year
 * @returns Array of habit log entries
 */
export async function getHabitLogs(
  userId: string,
  month: number,
  year: number
): Promise<HabitLogEntry[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const logs = await prisma.habitLog.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "desc" },
  });

  return logs.map((log) => ({
    id: log.id,
    habitType: log.habitType as HabitTypeKey,
    completed: log.completed,
    date: new Date(log.date).toISOString().split("T")[0]!,
    impactKg: log.impactKg,
    notes: log.notes ?? undefined,
  }));
}
