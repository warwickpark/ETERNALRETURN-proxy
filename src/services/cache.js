const Redis = require('redis');
const NodeCache = require('node-cache');
const config = require('../config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.redis = null;
    this.nodeCache = new NodeCache({ stdTTL: config.cache.defaultTTL });
    this.connected = false;
  }

  async connect() {
    try {
      this.redis = Redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      await this.redis.connect();
      this.connected = true;
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Redis connection failed:', error);
      this.connected = false;
    }
  }

  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `bser:${endpoint}:${sortedParams}`;
  }

  getTTL(endpoint) {
    const ttlMap = {
      'user/nickname': config.cache.userTTL,
      'v1/rank/top': config.cache.rankTTL,
      'v2/rank/top': config.cache.rankTTL,
      'rank': config.cache.rankTTL,
      'user/stats': config.cache.statsTTL,
      'user/games': config.cache.defaultTTL,
      'games': config.cache.defaultTTL,
      'unionTeam': config.cache.userTTL,
      'v1/data': config.cache.defaultTTL * 6, // 30분
      'v2/data': config.cache.defaultTTL * 6, // 30분
      'v1/l10n': config.cache.defaultTTL * 12, // 1시간
      'v1/weaponRoutes': config.cache.defaultTTL * 2, // 10분
    };

    for (const [key, ttl] of Object.entries(ttlMap)) {
      if (endpoint.includes(key)) {
        return ttl;
      }
    }

    return config.cache.defaultTTL;
  }

  async get(key) {
    try {
      // L1 Cache (Memory)
      const memoryResult = this.nodeCache.get(key);
      if (memoryResult) {
        logger.debug(`Cache hit (memory): ${key}`);
        return memoryResult;
      }

      // L2 Cache (Redis)
      if (this.connected) {
        const redisResult = await this.redis.get(key);
        if (redisResult) {
          const parsed = JSON.parse(redisResult);
          // 메모리 캐시에도 저장 (짧은 TTL)
          this.nodeCache.set(key, parsed, 60);
          logger.debug(`Cache hit (redis): ${key}`);
          return parsed;
        }
      }

      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const finalTTL = ttl || config.cache.defaultTTL;
      
      // L1 Cache (Memory) - 짧은 TTL
      this.nodeCache.set(key, value, Math.min(finalTTL, 300));

      // L2 Cache (Redis) - 긴 TTL
      if (this.connected) {
        await this.redis.setEx(key, finalTTL, JSON.stringify(value));
      }

      logger.debug(`Cache set: ${key} (TTL: ${finalTTL}s)`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key) {
    try {
      this.nodeCache.del(key);
      if (this.connected) {
        await this.redis.del(key);
      }
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async clear() {
    try {
      this.nodeCache.flushAll();
      if (this.connected) {
        await this.redis.flushDb();
      }
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  async getStats() {
    try {
      const memoryStats = this.nodeCache.getStats();
      let redisStats = {};
      
      if (this.connected) {
        const info = await this.redis.info('memory');
        redisStats = {
          connected: true,
          memory: info
        };
      }

      return {
        memory: memoryStats,
        redis: redisStats
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { error: error.message };
    }
  }
}

module.exports = new CacheService();