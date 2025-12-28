const validateNickname = (req, res, next) => {
  const { nickname } = req.query;
  
  if (!nickname) {
    return res.status(400).json({
      code: 400,
      message: 'Nickname is required',
      error: 'VALIDATION_ERROR'
    });
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return res.status(400).json({
      code: 400,
      message: 'Nickname must be between 2 and 20 characters',
      error: 'VALIDATION_ERROR'
    });
  }

  next();
};

const validateUserNum = (req, res, next) => {
  const { userNum } = req.params;

  if (!userNum || isNaN(userNum)) {
    return res.status(400).json({
      code: 400,
      message: 'Valid user number is required',
      error: 'VALIDATION_ERROR'
    });
  }

  req.params.userNum = parseInt(userNum);
  next();
};

const validateUserId = (req, res, next) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      code: 400,
      message: 'Valid user ID is required',
      error: 'VALIDATION_ERROR'
    });
  }

  // userId 형식 검증 (Base64 URL-safe 문자열)
  if (userId.length < 20 || userId.length > 100) {
    return res.status(400).json({
      code: 400,
      message: 'User ID must be between 20 and 100 characters',
      error: 'VALIDATION_ERROR'
    });
  }

  if (!/^[A-Za-z0-9_-]+$/.test(userId)) {
    return res.status(400).json({
      code: 400,
      message: 'User ID contains invalid characters',
      error: 'VALIDATION_ERROR'
    });
  }

  next();
};

const validateSeasonId = (req, res, next) => {
  const { seasonId } = req.params;
  
  if (!seasonId || isNaN(seasonId)) {
    return res.status(400).json({
      code: 400,
      message: 'Valid season ID is required',
      error: 'VALIDATION_ERROR'
    });
  }

  const season = parseInt(seasonId);
  if (season < 0 || season > 100) {
    return res.status(400).json({
      code: 400,
      message: 'Season ID must be between 0 and 100',
      error: 'VALIDATION_ERROR'
    });
  }

  req.params.seasonId = season;
  next();
};

const validateMatchingTeamMode = (req, res, next) => {
  const { matchingTeamMode } = req.params;
  
  if (!matchingTeamMode || isNaN(matchingTeamMode)) {
    return res.status(400).json({
      code: 400,
      message: 'Valid matching team mode is required',
      error: 'VALIDATION_ERROR'
    });
  }

  const mode = parseInt(matchingTeamMode);
  if (![1, 2, 3, 8].includes(mode)) {
    return res.status(400).json({
      code: 400,
      message: 'Matching team mode must be 1 (Solo), 2 (Duo), 3 (Squad), or 8 (Union)',
      error: 'VALIDATION_ERROR'
    });
  }

  req.params.matchingTeamMode = mode;
  next();
};

const validateMatchingMode = (req, res, next) => {
  const { matchingMode } = req.params;
  
  if (matchingMode && !isNaN(matchingMode)) {
    const mode = parseInt(matchingMode);
    if (![2, 3].includes(mode)) {
      return res.status(400).json({
        code: 400,
        message: 'Matching mode must be 2 (Normal) or 3 (Ranked)',
        error: 'VALIDATION_ERROR'
      });
    }
    req.params.matchingMode = mode;
  }
  
  next();
};

const validateServerCode = (req, res, next) => {
  const { serverCode } = req.params;
  
  if (serverCode && !isNaN(serverCode)) {
    const code = parseInt(serverCode);
    if (![10, 12, 13, 14, 17].includes(code)) {
      return res.status(400).json({
        code: 400,
        message: 'Server code must be 10 (Asia), 17 (Asia2), 12 (NorthAmerica), 13 (Europe), or 14 (SouthAmerica)',
        error: 'VALIDATION_ERROR'
      });
    }
    req.params.serverCode = code;
  }
  
  next();
};

const validateGameId = (req, res, next) => {
  const { gameId } = req.params;
  
  if (!gameId || isNaN(gameId)) {
    return res.status(400).json({
      code: 400,
      message: 'Valid game ID is required',
      error: 'VALIDATION_ERROR'
    });
  }

  req.params.gameId = parseInt(gameId);
  next();
};

const validateLanguage = (req, res, next) => {
  const { language } = req.params;
  
  const validLanguages = [
    'Korean', 'English', 'Japanese', 'ChineseSimplified', 'ChineseTraditional',
    'French', 'Spanish', 'SpanishLatin', 'Portuguese', 'PortugueseLatin',
    'Indonesian', 'German', 'Russian', 'Thai', 'Vietnamese'
  ];
  
  if (!language || !validLanguages.includes(language)) {
    return res.status(400).json({
      code: 400,
      message: `Language must be one of: ${validLanguages.join(', ')}`,
      error: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

const validateMetaType = (req, res, next) => {
  const { metaType } = req.params;
  
  if (!metaType || metaType.length === 0) {
    return res.status(400).json({
      code: 400,
      message: 'Meta type is required',
      error: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

const validateRouteId = (req, res, next) => {
  const { routeId } = req.params;
  
  if (routeId && isNaN(routeId)) {
    return res.status(400).json({
      code: 400,
      message: 'Valid route ID is required',
      error: 'VALIDATION_ERROR'
    });
  }

  if (routeId) {
    req.params.routeId = parseInt(routeId);
  }
  
  next();
};

module.exports = {
  validateNickname,
  validateUserNum,
  validateUserId,
  validateSeasonId,
  validateMatchingTeamMode,
  validateMatchingMode,
  validateServerCode,
  validateGameId,
  validateLanguage,
  validateMetaType,
  validateRouteId
};