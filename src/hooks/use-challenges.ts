"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  ChallengeData,
  UserChallengeData,
  BadgeData,
} from "@/types/habit.types";

/**
 * State and actions for challenge management.
 */
interface UseChallengesReturn {
  /** Available challenges to join */
  availableChallenges: ChallengeData[];
  /** User's current/past challenges */
  userChallenges: UserChallengeData[];
  /** User's badges */
  badges: BadgeData[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Fetch available challenges */
  fetchChallenges: () => Promise<void>;
  /** Fetch user's challenges */
  fetchUserChallenges: () => Promise<void>;
  /** Join a challenge */
  joinChallenge: (challengeId: string) => Promise<boolean>;
  /** Update challenge progress */
  updateProgress: (challengeId: string, progress: number) => Promise<boolean>;
  /** Fetch user badges */
  fetchBadges: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Custom hook for challenge and gamification features.
 * Manages available challenges, user enrollments, progress tracking, and badges.
 *
 * @returns Challenge state and action methods
 */
export function useChallenges(): UseChallengesReturn {
  const [availableChallenges, setAvailableChallenges] = useState<ChallengeData[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallengeData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges");
      const json = await res.json();
      if (json.success) {
        setAvailableChallenges(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges/user");
      const json = await res.json();
      if (json.success) {
        setUserChallenges(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user challenges"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const joinChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchUserChallenges();
        return true;
      }
      setError(json.error);
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join challenge");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUserChallenges]);

  const updateProgress = useCallback(
    async (challengeId: string, progress: number): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/challenges/${challengeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ progress }),
        });
        const json = await res.json();
        if (json.success) {
          await fetchUserChallenges();
          return true;
        }
        setError(json.error);
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update progress"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserChallenges]
  );

  const fetchBadges = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges/user?badges=true");
      const json = await res.json();
      if (json.success && json.data.badges) {
        setBadges(json.data.badges);
      }
    } catch {
      // Silently fail for badge fetch
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Fetch on mount
  useEffect(() => {
    void fetchChallenges();
    void fetchUserChallenges();
  }, [fetchChallenges, fetchUserChallenges]);

  return {
    availableChallenges,
    userChallenges,
    badges,
    loading,
    error,
    fetchChallenges,
    fetchUserChallenges,
    joinChallenge,
    updateProgress,
    fetchBadges,
    clearError,
  };
}
