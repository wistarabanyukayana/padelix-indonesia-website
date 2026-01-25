type RateLimitOptions = {
  intervalMs: number;
  max: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitState>();

export function rateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || now > current.resetAt) {
    const resetAt = now + options.intervalMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: options.max - 1, resetAt };
  }

  if (current.count >= options.max) {
    return { success: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  store.set(key, current);
  return {
    success: true,
    remaining: options.max - current.count,
    resetAt: current.resetAt,
  };
}
