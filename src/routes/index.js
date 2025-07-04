const express = require('express');
const router = express.Router();
const bserApi = require('../services/bserApi');
const validation = require('../middleware/validation');

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

// 유저 랭크 조회
router.get('/rank/:userNum/:seasonId/:matchingTeamMode',
  validation.validateUserNum,
  validation.validateSeasonId,
  validation.validateMatchingTeamMode,
  async (req, res, next) => {
    try {
      const { userNum, seasonId, matchingTeamMode } = req.params;
      const result = await bserApi.getUserRank(userNum, seasonId, matchingTeamMode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유니온 팀 정보 조회
router.get('/unionTeam/:userNum/:seasonId',
  validation.validateUserNum,
  validation.validateSeasonId,
  async (req, res, next) => {
    try {
      const { userNum, seasonId } = req.params;
      const result = await bserApi.getUnionTeam(userNum, seasonId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 통계 조회 (V1)
router.get('/user/stats/:userNum/:seasonId',
  validation.validateUserNum,
  validation.validateSeasonId,
  async (req, res, next) => {
    try {
      const { userNum, seasonId } = req.params;
      const result = await bserApi.getUserStats(userNum, seasonId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 통계 조회 (V2)
router.get('/user/stats/:userNum/:seasonId/:matchingMode',
  validation.validateUserNum,
  validation.validateSeasonId,
  validation.validateMatchingMode,
  async (req, res, next) => {
    try {
      const { userNum, seasonId, matchingMode } = req.params;
      const result = await bserApi.getUserStats(userNum, seasonId, matchingMode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 유저 게임 기록 조회
router.get('/user/games/:userNum',
  validation.validateUserNum,
  async (req, res, next) => {
    try {
      const { userNum } = req.params;
      const result = await bserApi.getUserGames(userNum);
      res.json(result);
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