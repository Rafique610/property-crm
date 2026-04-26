// FILE: middleware/rateLimit.js
// Assignment requirement: Agents = 50 req/min, Admins = no limit

const requestCounts = new Map(); // In-memory store (use Redis in production)

/**
 * Rate limiter middleware for Next.js API routes.
 * Usage: call at the top of any route handler after verifyToken.
 *
 * @param {object} user - Decoded JWT user { userId, role }
 * @returns {object|null} - { error, status } if rate limited, null if allowed
 */
export function checkRateLimit(user) {
  // Admins have no rate limit
  if (user.role === "admin") return null;

  const LIMIT = 50; // requests per minute for agents
  const WINDOW_MS = 60 * 1000; // 1 minute

  const key = `${user.userId}`;
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now - record.windowStart > WINDOW_MS) {
    // Start a new window
    requestCounts.set(key, { count: 1, windowStart: now });
    return null;
  }

  record.count += 1;

  if (record.count > LIMIT) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - record.windowStart)) / 1000);
    return {
      error: `Rate limit exceeded. Agents are limited to ${LIMIT} requests per minute.`,
      status: 429,
      retryAfter,
    };
  }

  return null;
}