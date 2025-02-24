import { APIError } from './api-error';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
};

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
) {
  const now = Date.now();
  const key = `${identifier}`;

  // Clean up expired entries
  if (store[key] && store[key].resetTime <= now) {
    delete store[key];
  }

  // Initialize or get existing entry
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Increment count
  store[key].count++;

  // Check if over limit
  if (store[key].count > config.max) {
    throw new APIError(
      'Too many requests, please try again later',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  // Return remaining requests and reset time
  return {
    remaining: config.max - store[key].count,
    resetTime: store[key].resetTime,
  };
}

export function createRateLimitMiddleware(config?: RateLimitConfig) {
  return async function rateLimitMiddleware(
    request: Request,
    context: { params: any }
  ) {
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    return rateLimit(identifier, config);
  };
} 