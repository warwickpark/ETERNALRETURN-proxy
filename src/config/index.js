require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  bser: {
    baseUrl: process.env.BSER_API_BASE_URL || 'https://open-api.bser.io',
    apiKey: process.env.BSER_API_KEY,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  cache: {
    defaultTTL: parseInt(process.env.DEFAULT_CACHE_TTL) || 300,
    userTTL: parseInt(process.env.USER_CACHE_TTL) || 600,
    rankTTL: parseInt(process.env.RANK_CACHE_TTL) || 1800,
    statsTTL: parseInt(process.env.STATS_CACHE_TTL) || 900,
  },
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY) || 2,
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS) || 3,
    delayMs: parseInt(process.env.QUEUE_DELAY_MS) || 500,
  },
  circuitBreaker: {
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000,
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 300000,
    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 5,
  },
};

module.exports = config;