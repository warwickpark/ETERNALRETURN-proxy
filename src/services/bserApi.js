const config = require('../config');
const cacheService = require('./cache');
const queueService = require('./queue');
const circuitBreaker = require('./circuitBreaker');
const logger = require('../utils/logger');

class BserApiService {
  constructor() {
    this.baseUrl = config.bser.baseUrl;
    this.apiKey = config.bser.apiKey;
    this.headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'BSER-Cache-Proxy/1.0'
    };
    
    // API 키 문제 감지
    this.authErrorCount = 0;
    this.authErrorThreshold = 5; // 5번 연속 인증 오류 시 알람
    this.lastAuthError = null;
    this.isApiKeyValid = true;
  }

  async makeRequest(endpoint, params = {}) {
    try {
      // 캐시 키 생성
      const cacheKey = cacheService.generateKey(endpoint, params);
      const ttl = cacheService.getTTL(endpoint);

      // 캐시 확인
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for ${endpoint}`);
        return cachedData;
      }

      // URL 생성
      const url = this.buildUrl(endpoint, params);
      
      // Circuit Breaker와 Queue를 통한 API 호출
      const result = await circuitBreaker.execute('bser-api', async () => {
        const response = await queueService.addRequest(url, this.headers);
        
        // API 키 오류는 서킷브레이커 실행 전에 먼저 처리
        if ((response.isError && (response.status === 401 || response.status === 403)) || 
            (response.status === 401 || response.status === 403)) {
          logger.warn(`API Key Error detected: ${response.status}`);
          this.handleAuthError(response.status);
          const authError = new Error(`Authentication Error: ${response.status}`);
          authError.isClientError = true;
          authError.statusCode = response.status;
          authError.data = response.data;
          throw authError;
        }
        
        // 기타 4xx 에러는 서킷브레이커 실패로 카운트하지 않음
        if (response.isError || (response.status >= 400 && response.status < 500)) {
          const clientError = new Error(`Client Error: ${response.status}`);
          clientError.isClientError = true;
          clientError.statusCode = response.status;
          clientError.data = response.data;
          throw clientError;
        }
        
        return response;
      });

      // 성공적인 응답만 캐시
      if (result.data && result.status === 200) {
        await cacheService.set(cacheKey, result.data, ttl);
        logger.debug(`API response cached for ${endpoint}`);
        
        // 성공적인 요청 시 API 키 상태 리셋
        this.resetAuthErrorCount();
      }

      return result.data;
    } catch (error) {
      // 클라이언트 에러는 그대로 전파 (서킷브레이커 실패 카운트 안됨)
      if (error.isClientError) {
        logger.debug(`Client error for ${endpoint}: ${error.statusCode}`);
        // API 키 오류는 이미 Circuit Breaker 내부에서 처리됨
        throw this.handleApiError(error, endpoint);
      }
      
      logger.error(`API request failed for ${endpoint}:`, error.message);
      throw this.handleApiError(error, endpoint);
    }
  }

  buildUrl(endpoint, params) {
    let url = `${this.baseUrl}/${endpoint}`;
    
    // Query parameters 처리
    if (params.query) {
      const queryParams = new URLSearchParams(params.query);
      url += `?${queryParams.toString()}`;
    }

    return url;
  }

  handleApiError(error, endpoint) {
    // 클라이언트 에러인 경우 상태 코드 기반 처리
    if (error.isClientError) {
      const statusCode = error.statusCode;
      const apiError = new Error(this.getErrorMessage(statusCode, endpoint));
      apiError.statusCode = statusCode;
      apiError.isClientError = true;
      return apiError;
    }
    
    const errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('Network Error')) {
      return new Error('Network connection failed');
    } else if (errorMessage.includes('timeout')) {
      return new Error('Request timeout');
    }

    return error;
  }

  handleAuthError(statusCode) {
    this.authErrorCount++;
    this.lastAuthError = new Date();
    
    logger.warn(`Authentication error ${statusCode} (count: ${this.authErrorCount})`);
    
    if (this.authErrorCount >= this.authErrorThreshold) {
      this.isApiKeyValid = false;
      logger.error(`⚠️  CRITICAL: API Key problem detected! ${this.authErrorCount} consecutive auth failures. Please check API key configuration.`);
      
      // 여기에 알람 로직 추가 가능 (Slack, Discord, Email 등)
      // this.sendApiKeyAlert();
    }
  }

  resetAuthErrorCount() {
    if (this.authErrorCount > 0) {
      logger.info(`API Key recovered. Resetting auth error count (was: ${this.authErrorCount})`);
    }
    this.authErrorCount = 0;
    this.lastAuthError = null;
    this.isApiKeyValid = true;
  }

  getAuthStatus() {
    return {
      isApiKeyValid: this.isApiKeyValid,
      authErrorCount: this.authErrorCount,
      lastAuthError: this.lastAuthError,
      authErrorThreshold: this.authErrorThreshold
    };
  }

  getErrorMessage(statusCode, endpoint) {
    switch (statusCode) {
      case 400:
        return 'Bad request - Invalid parameters';
      case 401:
        return 'Authentication failed - Invalid API key';
      case 403:
        return 'Access forbidden - Insufficient permissions';
      case 404:
        return 'Resource not found - User/data does not exist';
      case 429:
        return 'Rate limit exceeded - Too many requests';
      case 500:
        return 'Internal server error';
      case 502:
        return 'Bad gateway - Upstream server error';
      case 503:
        return 'Service unavailable - Server overloaded';
      case 504:
        return 'Gateway timeout - Upstream server timeout';
      default:
        return `HTTP ${statusCode} error`;
    }
  }

  // API 메서드들
  async getUserByNickname(nickname) {
    return this.makeRequest('v1/user/nickname', { 
      query: { query: nickname } 
    });
  }

  async getTopRankers(seasonId, matchingTeamMode, version = 'v1', serverCode = null) {
    const endpoint = version === 'v2' && serverCode 
      ? `v2/rank/top/${seasonId}/${serverCode}/${matchingTeamMode}`
      : `v1/rank/top/${seasonId}/${matchingTeamMode}`;
    
    return this.makeRequest(endpoint);
  }

  async getUserRank(userId, seasonId, matchingTeamMode) {
    return this.makeRequest(`v1/rank/uid/${userId}/${seasonId}/${matchingTeamMode}`);
  }

  async getUnionTeam(userId, seasonId) {
    return this.makeRequest(`v1/unionTeam/uid/${userId}/${seasonId}`);
  }

  async getUserStats(userId, seasonId, matchingMode = null) {
    const endpoint = matchingMode
      ? `v1/user/stats/uid/${userId}/${seasonId}/${matchingMode}`
      : `v1/user/stats/uid/${userId}/${seasonId}`;

    return this.makeRequest(endpoint);
  }

  async getUserGames(userId) {
    return this.makeRequest(`v1/user/games/uid/${userId}`);
  }

  async getGameResult(gameId) {
    return this.makeRequest(`v1/games/${gameId}`);
  }

  async getGameData(metaType, version = 'v2') {
    return this.makeRequest(`${version}/data/${metaType}`);
  }

  async getLanguageData(language) {
    return this.makeRequest(`v1/l10n/${language}`);
  }

  async getWeaponRoutes(routeId = null) {
    const endpoint = routeId 
      ? `v1/weaponRoutes/recommend/${routeId}`
      : 'v1/weaponRoutes/recommend';
    
    return this.makeRequest(endpoint);
  }

  // 헬스 체크
  async healthCheck() {
    try {
      const result = await this.makeRequest('v2/data/hash');
      
      // API 키 상태 확인
      const authStatus = this.getAuthStatus();
      if (!authStatus.isApiKeyValid) {
        return { 
          status: 'degraded', 
          message: `API Key issue detected (${authStatus.authErrorCount} auth failures)`,
          timestamp: Date.now(),
          apiKey: authStatus
        };
      }
      
      return { status: 'ok', timestamp: Date.now() };
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // 통계 정보
  async getServiceStats() {
    try {
      const [cacheStats, queueStats, circuitStats] = await Promise.all([
        cacheService.getStats(),
        queueService.getStats(),
        circuitBreaker.getStats()
      ]);

      return {
        cache: cacheStats,
        queue: queueStats,
        circuitBreaker: circuitStats,
        apiKey: this.getAuthStatus(),
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Service stats error:', error);
      throw error;
    }
  }
}

module.exports = new BserApiService();