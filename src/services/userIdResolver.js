const axios = require('axios');
const config = require('../config');
const cacheService = require('./cache');
const logger = require('../utils/logger');

/**
 * UserID Resolver Service
 *
 * userNum을 userId로 변환하는 서비스
 * - userNum → userId 매핑을 캐시에 저장 (30분)
 * - 원본 BSER API 호환성 유지
 */
class UserIdResolver {
  constructor() {
    this.baseUrl = config.bser.baseUrl;
    this.apiKey = config.bser.apiKey;
    this.cacheTTL = 1800; // 30분
  }

  /**
   * userNum을 userId로 변환
   * @param {number} userNum - 기존 유저 번호
   * @returns {Promise<string>} userId - 새로운 유저 ID
   */
  async resolveUserId(userNum) {
    try {
      // 1. 캐시 확인
      const cacheKey = `usernum:${userNum}:userid`;
      const cachedUserId = await cacheService.get(cacheKey);

      if (cachedUserId) {
        logger.debug(`UserId cache hit for userNum ${userNum}: ${cachedUserId}`);
        return cachedUserId;
      }

      // 2. 캐시 미스 - 닉네임 조회를 통한 userId 획득
      logger.debug(`UserId cache miss for userNum ${userNum}, fetching from API`);

      // userNum으로 직접 userId를 얻을 수 없으므로
      // 실제로는 클라이언트가 userId를 사용하도록 권장
      // 여기서는 에러 처리
      const error = new Error(
        `Cannot resolve userId from userNum ${userNum}. ` +
        `BSER API no longer supports userNum-based queries. ` +
        `Please use /user/nickname API to get userId first.`
      );
      error.statusCode = 400;
      error.isClientError = true;
      throw error;

    } catch (error) {
      logger.error(`Failed to resolve userId for userNum ${userNum}:`, error.message);
      throw error;
    }
  }

  /**
   * 닉네임으로 userId 조회 및 캐싱
   * @param {string} nickname - 유저 닉네임
   * @returns {Promise<{userId: string, nickname: string}>}
   */
  async getUserIdByNickname(nickname) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/user/nickname`,
        {
          params: { query: nickname },
          headers: {
            'x-api-key': this.apiKey,
            'User-Agent': 'BSER-Cache-Proxy/1.0'
          }
        }
      );

      if (response.data && response.data.user) {
        const { userId, nickname: returnedNickname } = response.data.user;

        // userId 캐싱 (닉네임 기준)
        const cacheKey = `nickname:${nickname.toLowerCase()}:userid`;
        await cacheService.set(cacheKey, userId, this.cacheTTL);

        logger.debug(`Cached userId for nickname ${nickname}: ${userId}`);

        return {
          userId,
          nickname: returnedNickname
        };
      }

      throw new Error('User not found');
    } catch (error) {
      logger.error(`Failed to get userId for nickname ${nickname}:`, error.message);
      throw error;
    }
  }

  /**
   * userNum이 유효한 숫자인지 확인
   * @param {*} value
   * @returns {boolean}
   */
  isUserNum(value) {
    return !isNaN(value) && Number.isInteger(Number(value));
  }

  /**
   * userId가 유효한 문자열인지 확인
   * @param {*} value
   * @returns {boolean}
   */
  isUserId(value) {
    return typeof value === 'string' && value.length > 20 && /^[A-Za-z0-9_-]+$/.test(value);
  }
}

module.exports = new UserIdResolver();
