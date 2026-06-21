/**
 * Simple in-memory rate limiter using token bucket algorithm.
 * Suitable for serverless/edge environments.
 *
 * For production at scale, consider using Redis-backed rate limiting.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/** Clean up old entries every 5 minutes to prevent memory leaks */
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  const staleThreshold = now - 10 * 60 * 1000; // 10 minutes
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.lastRefill < staleThreshold) {
      rateLimitMap.delete(key);
    }
  }
  lastCleanup = now;
}

/**
 * Check if a request should be rate-limited.
 *
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param maxTokens - Maximum tokens in the bucket (burst capacity)
 * @param refillRate - Tokens refilled per second
 * @returns Object with allowed status and remaining tokens
 */
export function checkRateLimit(
  identifier: string,
  maxTokens: number = 100,
  refillRate: number = 1.67 // ~100 per minute
): { allowed: boolean; remaining: number; retryAfter?: number } {
  cleanupStaleEntries();

  const now = Date.now();
  let entry = rateLimitMap.get(identifier);

  if (!entry) {
    entry = { tokens: maxTokens - 1, lastRefill: now };
    rateLimitMap.set(identifier, entry);
    return { allowed: true, remaining: entry.tokens };
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - entry.lastRefill) / 1000;
  const tokensToAdd = elapsed * refillRate;
  entry.tokens = Math.min(maxTokens, entry.tokens + tokensToAdd);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    const retryAfter = Math.ceil((1 - entry.tokens) / refillRate);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.tokens -= 1;
  return { allowed: true, remaining: Math.floor(entry.tokens) };
}

/**
 * Rate limit headers to include in API responses.
 */
export function rateLimitHeaders(
  remaining: number,
  limit: number = 100,
  retryAfter?: number
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
  if (retryAfter !== undefined) {
    headers["Retry-After"] = String(retryAfter);
  }
  return headers;
}
