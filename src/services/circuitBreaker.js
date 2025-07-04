const config = require('../config');
const logger = require('../utils/logger');

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.timeout = options.timeout || config.circuitBreaker.timeout;
    this.resetTimeout = options.resetTimeout || config.circuitBreaker.resetTimeout;
    this.failureThreshold = options.failureThreshold || config.circuitBreaker.failureThreshold;
    this.monitoringPeriod = options.monitoringPeriod || 60000; // 1분
    this.requests = [];
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        logger.info(`Circuit breaker ${this.name} is now HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await this.executeWithTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  async executeWithTimeout(operation) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.timeout}ms`));
      }, this.timeout);

      operation()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  onSuccess() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.info(`Circuit breaker ${this.name} is now CLOSED`);
    }

    this.recordRequest(true);
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.recordRequest(false);

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.error(`Circuit breaker ${this.name} is now OPEN (${this.failureCount} failures)`);
    }
  }

  shouldAttemptReset() {
    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }

  recordRequest(success) {
    const now = Date.now();
    this.requests.push({
      timestamp: now,
      success
    });

    // 모니터링 기간 이전의 요청들 제거
    this.requests = this.requests.filter(
      req => now - req.timestamp <= this.monitoringPeriod
    );
  }

  getStats() {
    const now = Date.now();
    const recentRequests = this.requests.filter(
      req => now - req.timestamp <= this.monitoringPeriod
    );

    const totalRequests = recentRequests.length;
    const successfulRequests = recentRequests.filter(req => req.success).length;
    const failedRequests = totalRequests - successfulRequests;

    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      nextRetryTime: this.state === 'OPEN' && this.lastFailureTime 
        ? this.lastFailureTime + this.resetTimeout 
        : null
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.requests = [];
    logger.info(`Circuit breaker ${this.name} has been reset`);
  }
}

class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
  }

  getBreaker(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, options));
    }
    return this.breakers.get(name);
  }

  execute(name, operation, options = {}) {
    const breaker = this.getBreaker(name, options);
    return breaker.execute(operation);
  }

  getStats() {
    const stats = {};
    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  reset(name) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
    }
  }

  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

module.exports = new CircuitBreakerManager();