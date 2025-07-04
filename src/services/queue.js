const Bull = require('bull');
const config = require('../config');
const logger = require('../utils/logger');

class QueueService {
  constructor() {
    this.apiQueue = null;
    this.pendingRequests = new Map(); // Request deduplication
  }

  async initialize() {
    try {
      this.apiQueue = new Bull('bser-api-queue', {
        redis: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: config.queue.maxAttempts,
          backoff: {
            type: 'exponential',
            delay: config.queue.delayMs,
          },
        },
      });

      // 동시 처리 제한 (초당 2회)
      this.apiQueue.process('api-request', config.queue.concurrency, this.processApiRequest.bind(this));

      // 이벤트 리스너
      this.apiQueue.on('completed', (job, result) => {
        logger.debug(`Job completed: ${job.id}`);
        this.resolveRequest(job.data.requestId, result);
      });

      this.apiQueue.on('failed', (job, err) => {
        logger.error(`Job failed: ${job.id}`, err);
        this.rejectRequest(job.data.requestId, err);
      });

      logger.info('Queue service initialized');
    } catch (error) {
      logger.error('Queue initialization failed:', error);
      throw error;
    }
  }

  async processApiRequest(job) {
    const { url, headers, requestId } = job.data;
    
    try {
      const axios = require('axios');
      const response = await axios.get(url, { headers });
      
      logger.debug(`API request successful: ${url}`);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      logger.error(`API request failed: ${url}`, error.message);
      
      if (error.response) {
        // HTTP 응답이 있는 경우 상태 코드와 함께 반환
        return {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
          isError: true
        };
      } else if (error.request) {
        throw new Error('Network Error: No response received');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  async addRequest(url, headers = {}) {
    const requestId = this.generateRequestId(url);
    
    // Request deduplication
    if (this.pendingRequests.has(requestId)) {
      logger.debug(`Duplicate request detected: ${requestId}`);
      return this.pendingRequests.get(requestId);
    }

    // Create promise for request
    const requestPromise = new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timestamp: Date.now(),
      });
    });

    // Add job to queue
    try {
      const job = await this.apiQueue.add('api-request', {
        url,
        headers,
        requestId,
      }, {
        priority: this.getRequestPriority(url),
        delay: this.calculateDelay(),
      });

      logger.debug(`Request queued: ${requestId} (Job: ${job.id})`);
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }

    return requestPromise;
  }

  generateRequestId(url) {
    return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  getRequestPriority(url) {
    // 높은 우선순위: 유저 정보, 랭크 정보
    if (url.includes('user/nickname') || url.includes('rank/')) {
      return 10;
    }
    
    // 중간 우선순위: 통계, 게임 정보
    if (url.includes('user/stats') || url.includes('games/')) {
      return 5;
    }
    
    // 낮은 우선순위: 메타 데이터, 언어 정보
    return 1;
  }

  calculateDelay() {
    // 큐 길이에 따른 동적 지연
    const queueLength = this.apiQueue ? this.apiQueue.waiting : 0;
    return Math.max(0, (queueLength * config.queue.delayMs) - config.queue.delayMs);
  }

  resolveRequest(requestId, result) {
    const request = this.pendingRequests.get(requestId);
    if (request) {
      request.resolve(result);
      this.pendingRequests.delete(requestId);
    }
  }

  rejectRequest(requestId, error) {
    const request = this.pendingRequests.get(requestId);
    if (request) {
      request.reject(error);
      this.pendingRequests.delete(requestId);
    }
  }

  async getStats() {
    try {
      const waiting = await this.apiQueue.getWaiting();
      const active = await this.apiQueue.getActive();
      const completed = await this.apiQueue.getCompleted();
      const failed = await this.apiQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        pending: this.pendingRequests.size,
      };
    } catch (error) {
      logger.error('Queue stats error:', error);
      return { error: error.message };
    }
  }

  async cleanup() {
    try {
      // 오래된 pending requests 정리 (5분 이상)
      const now = Date.now();
      const expiredRequests = [];
      
      for (const [requestId, request] of this.pendingRequests.entries()) {
        if (now - request.timestamp > 5 * 60 * 1000) {
          expiredRequests.push(requestId);
        }
      }

      expiredRequests.forEach(requestId => {
        this.rejectRequest(requestId, new Error('Request timeout'));
      });

      if (expiredRequests.length > 0) {
        logger.info(`Cleaned up ${expiredRequests.length} expired requests`);
      }
    } catch (error) {
      logger.error('Queue cleanup error:', error);
    }
  }
}

module.exports = new QueueService();