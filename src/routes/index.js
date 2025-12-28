const express = require('express');
const router = express.Router();
const bserApi = require('../services/bserApi');
const validation = require('../middleware/validation');
const logger = require('../utils/logger');

// 유저 닉네임으로 정보 조회
router.get('/user/nickname', validation.validateNickname, async (req, res, next) => {
  try {
    const { nickname } = req.query;
    const result = await bserApi.getUserByNickname(nickname);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 상위 랭커 조회 (V1)
router.get('/v1/rank/top/:seasonId/:matchingTeamMode', 
  validation.validateSeasonId,
  validation.validateMatchingTeamMode,
  async (req, res, next) => {
    try {
      const { seasonId, matchingTeamMode } = req.params;
      const result = await bserApi.getTopRankers(seasonId, matchingTeamMode, 'v1');
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 상위 랭커 조회 (V2)
router.get('/v2/rank/top/:seasonId/:serverCode/:matchingTeamMode',
  validation.validateSeasonId,
  validation.validateServerCode,
  validation.validateMatchingTeamMode,
  async (req, res, next) => {
    try {
      const { seasonId, serverCode, matchingTeamMode } = req.params;
      const result = await bserApi.getTopRankers(seasonId, matchingTeamMode, 'v2', serverCode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 랭크 조회 (신규 - userId 기반)
router.get('/rank/uid/:userId/:seasonId/:matchingTeamMode',
  validation.validateUserId,
  validation.validateSeasonId,
  validation.validateMatchingTeamMode,
  async (req, res, next) => {
    try {
      const { userId, seasonId, matchingTeamMode } = req.params;
      const result = await bserApi.getUserRank(userId, seasonId, matchingTeamMode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 랭크 조회 (기존 - userNum 기반, DEPRECATED)
router.get('/rank/:userNum/:seasonId/:matchingTeamMode',
  validation.validateUserNum,
  validation.validateSeasonId,
  validation.validateMatchingTeamMode,
  async (req, res, next) => {
    try {
      const { userNum, seasonId, matchingTeamMode } = req.params;

      // Deprecation 경고
      logger.warn(`DEPRECATED: /rank/${userNum}/... endpoint used. This endpoint is deprecated. Please use /rank/uid/{userId}/... instead.`);
      res.setHeader('X-API-Deprecated', 'true');
      res.setHeader('X-API-Deprecation-Message', 'This endpoint is deprecated. Use /rank/uid/{userId} instead. BSER API no longer supports userNum-based queries.');

      // 에러 응답: userNum은 더 이상 지원되지 않음
      return res.status(400).json({
        code: 400,
        message: 'userNum-based API is no longer supported by BSER. Please use /user/nickname to get userId first, then use /rank/uid/{userId} endpoint.',
        error: 'DEPRECATED_ENDPOINT',
        migration: {
          step1: 'GET /user/nickname?nickname={nickname} to get userId',
          step2: 'Use userId in /rank/uid/{userId}/{seasonId}/{matchingTeamMode}'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 유니온 팀 정보 조회 (신규 - userId 기반)
router.get('/unionTeam/uid/:userId/:seasonId',
  validation.validateUserId,
  validation.validateSeasonId,
  async (req, res, next) => {
    try {
      const { userId, seasonId } = req.params;
      const result = await bserApi.getUnionTeam(userId, seasonId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유니온 팀 정보 조회 (기존 - DEPRECATED)
router.get('/unionTeam/:userNum/:seasonId',
  validation.validateUserNum,
  validation.validateSeasonId,
  async (req, res, next) => {
    try {
      const { userNum, seasonId } = req.params;
      logger.warn(`DEPRECATED: /unionTeam/${userNum}/... endpoint used`);
      res.setHeader('X-API-Deprecated', 'true');

      return res.status(400).json({
        code: 400,
        message: 'userNum-based API is no longer supported. Use /unionTeam/uid/{userId}/{seasonId} instead.',
        error: 'DEPRECATED_ENDPOINT'
      });
    } catch (error) {
      next(error);
    }
  }
);

// 유저 통계 조회 (신규 - userId 기반, V1)
router.get('/user/stats/uid/:userId/:seasonId',
  validation.validateUserId,
  validation.validateSeasonId,
  async (req, res, next) => {
    try {
      const { userId, seasonId } = req.params;
      const result = await bserApi.getUserStats(userId, seasonId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 통계 조회 (신규 - userId 기반, V2)
router.get('/user/stats/uid/:userId/:seasonId/:matchingMode',
  validation.validateUserId,
  validation.validateSeasonId,
  validation.validateMatchingMode,
  async (req, res, next) => {
    try {
      const { userId, seasonId, matchingMode } = req.params;
      const result = await bserApi.getUserStats(userId, seasonId, matchingMode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 통계 조회 (기존 - DEPRECATED, V1)
router.get('/user/stats/:userNum/:seasonId',
  validation.validateUserNum,
  validation.validateSeasonId,
  async (req, res, next) => {
    try {
      const { userNum, seasonId } = req.params;
      logger.warn(`DEPRECATED: /user/stats/${userNum}/... endpoint used`);
      res.setHeader('X-API-Deprecated', 'true');

      return res.status(400).json({
        code: 400,
        message: 'userNum-based API is no longer supported. Use /user/stats/uid/{userId}/{seasonId} instead.',
        error: 'DEPRECATED_ENDPOINT'
      });
    } catch (error) {
      next(error);
    }
  }
);

// 유저 통계 조회 (기존 - DEPRECATED, V2)
router.get('/user/stats/:userNum/:seasonId/:matchingMode',
  validation.validateUserNum,
  validation.validateSeasonId,
  validation.validateMatchingMode,
  async (req, res, next) => {
    try {
      const { userNum, seasonId, matchingMode } = req.params;
      logger.warn(`DEPRECATED: /user/stats/${userNum}/... endpoint used`);
      res.setHeader('X-API-Deprecated', 'true');

      return res.status(400).json({
        code: 400,
        message: 'userNum-based API is no longer supported. Use /user/stats/uid/{userId}/{seasonId}/{matchingMode} instead.',
        error: 'DEPRECATED_ENDPOINT'
      });
    } catch (error) {
      next(error);
    }
  }
);

// 유저 게임 기록 조회 (신규 - userId 기반)
router.get('/user/games/uid/:userId',
  validation.validateUserId,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await bserApi.getUserGames(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 게임 기록 조회 (기존 - DEPRECATED)
router.get('/user/games/:userNum',
  validation.validateUserNum,
  async (req, res, next) => {
    try {
      const { userNum } = req.params;
      logger.warn(`DEPRECATED: /user/games/${userNum} endpoint used`);
      res.setHeader('X-API-Deprecated', 'true');

      return res.status(400).json({
        code: 400,
        message: 'userNum-based API is no longer supported. Use /user/games/uid/{userId} instead.',
        error: 'DEPRECATED_ENDPOINT'
      });
    } catch (error) {
      next(error);
    }
  }
);

// 게임 결과 조회
router.get('/games/:gameId',
  validation.validateGameId,
  async (req, res, next) => {
    try {
      const { gameId } = req.params;
      const result = await bserApi.getGameResult(gameId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 게임 데이터 조회 (V1)
router.get('/v1/data/:metaType',
  validation.validateMetaType,
  async (req, res, next) => {
    try {
      const { metaType } = req.params;
      const result = await bserApi.getGameData(metaType, 'v1');
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 게임 데이터 조회 (V2)
router.get('/v2/data/:metaType',
  validation.validateMetaType,
  async (req, res, next) => {
    try {
      const { metaType } = req.params;
      const result = await bserApi.getGameData(metaType, 'v2');
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 언어 데이터 조회
router.get('/v1/l10n/:language',
  validation.validateLanguage,
  async (req, res, next) => {
    try {
      const { language } = req.params;
      const result = await bserApi.getLanguageData(language);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 추천 루트 조회
router.get('/v1/weaponRoutes/recommend',
  async (req, res, next) => {
    try {
      const result = await bserApi.getWeaponRoutes();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 특정 루트 조회
router.get('/v1/weaponRoutes/recommend/:routeId',
  validation.validateRouteId,
  async (req, res, next) => {
    try {
      const { routeId } = req.params;
      const result = await bserApi.getWeaponRoutes(routeId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 헬스 체크
router.get('/health', async (req, res, next) => {
  try {
    const result = await bserApi.healthCheck();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 서비스 통계
router.get('/stats', async (req, res, next) => {
  try {
    const result = await bserApi.getServiceStats();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;