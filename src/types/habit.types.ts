// ============================================
// Types — Habit Tracking
// ============================================

/** Available habit types for daily tracking */
export type HabitTypeKey =
  | "PUBLIC_TRANSPORT"
  | "AVOID_PLASTIC"
  | "REDUCE_ELECTRICITY"
  | "REUSABLE_BOTTLE"
  | "PLANT_BASED_MEAL"
  | "COMPOST_WASTE"
  | "BIKE_OR_WALK"
  | "NO_FOOD_WASTE";

/** Habit definition with metadata */
export interface HabitDefinition {
  type: HabitTypeKey;
  label: string;
  description: string;
  icon: string; // Emoji
  impactKgPerDay: number; // Estimated CO2 saved per day
  category: string;
}

/** Habit log entry from database */
export interface HabitLogEntry {
  id: string;
  habitType: HabitTypeKey;
  completed: boolean;
  date: string; // ISO date string
  impactKg: number;
  notes?: string;
}

/** Daily habit check-in */
export interface DailyCheckIn {
  date: string;
  habits: {
    habitType: HabitTypeKey;
    completed: boolean;
    notes?: string;
  }[];
}

/** Habit streak data */
export interface HabitStreak {
  habitType: HabitTypeKey;
  currentStreak: number; // consecutive days
  longestStreak: number;
  totalDays: number;
  lastCompletedDate: string | null;
}

/** Habit impact summary */
export interface HabitImpactSummary {
  totalCo2SavedKg: number;
  habitBreakdown: {
    habitType: HabitTypeKey;
    label: string;
    daysCompleted: number;
    co2SavedKg: number;
  }[];
  weeklyAverage: number;
  monthlyProjection: number;
}

// ============================================
// Types — Challenges & Gamification
// ============================================

export type ChallengeDifficultyType = "EASY" | "MEDIUM" | "HARD";
export type ChallengeStatusType = "ACTIVE" | "COMPLETED" | "FAILED" | "ABANDONED";

/** Challenge definition */
export interface ChallengeData {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsReward: number;
  durationDays: number;
  badgeIcon: string;
  difficulty: ChallengeDifficultyType;
  isActive: boolean;
}

/** User's active challenge */
export interface UserChallengeData {
  id: string;
  challenge: ChallengeData;
  startDate: string;
  endDate: string;
  status: ChallengeStatusType;
  progress: number;
  completedAt?: string;
}

/** Badge definition */
export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  pointsRequired: number;
  earned: boolean;
  earnedAt?: string;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image?: string;
  totalPoints: number;
  reductionPct: number;
  badges: number;
}

// ============================================
// Types — Forecast
// ============================================

/** Forecast data point */
export interface ForecastPoint {
  date: string;
  predictedCo2: number;
  confidenceLow: number;
  confidenceHigh: number;
}

/** Forecast result */
export interface ForecastResult {
  projectedMonthly: number;
  trend: "increasing" | "decreasing" | "stable";
  trendPct: number;
  dailyForecasts: ForecastPoint[];
  factors: string[]; // factors influencing forecast
}
