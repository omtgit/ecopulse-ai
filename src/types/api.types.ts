// ============================================
// Types — API Responses
// ============================================

/** Standard API success response */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/** API query parameters for listing endpoints */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Weekly report data for PDF generation */
export interface WeeklyReportData {
  id: string;
  userName: string;
  weekStart: string;
  weekEnd: string;
  totalCo2: number;
  reductionPct: number;
  highlights: string[];
  categoryData: {
    category: string;
    co2Kg: number;
    percentage: number;
  }[];
  habitsCompleted: number;
  challengesCompleted: number;
  pointsEarned: number;
  aiRecommendations: string[];
  generatedAt: string;
}

/** AI recommendation response */
export interface AIRecommendation {
  id: string;
  suggestion: string;
  category: string;
  estimatedSavingKg: number;
  priority: "high" | "medium" | "low";
  actionType: "reduce" | "replace" | "offset";
}

/** User profile */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  city?: string;
  country?: string;
  totalPoints: number;
  memberSince: string;
  badges: number;
  currentStreak: number;
}

/** Dashboard summary data */
export interface DashboardData {
  monthlyFootprint: number;
  previousMonthFootprint: number;
  reductionPct: number;
  categoryBreakdown: { category: string; co2Kg: number; color: string }[];
  trendData: { label: string; co2: number }[];
  currentStreak: number;
  activeHabits: number;
  activeChallenges: number;
  totalPointsThisMonth: number;
  comparisonWithAverage: number; // percentage (negative = better)
  recentBadges: { name: string; icon: string; earnedAt: string }[];
}
