const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Circuit Breaker 에러
  if (err.message.includes('Circuit breaker')) {
    return res.status(503).json({
      code: 503,
      message: 'Service temporarily unavailable',
      error: 'CIRCUIT_BREAKER_OPEN'
    });
  }

  // Rate Limit 에러
  if (err.message.includes('Rate limit')) {
    return res.status(429).json({
      code: 429,
      message: 'Too many requests',
      error: 'RATE_LIMIT_EXCEEDED'
    });
  }

  // 인증 에러
  if (err.message.includes('Authentication failed')) {
    return res.status(401).json({
      code: 401,
      message: 'Authentication failed',
      error: 'UNAUTHORIZED'
    });
  }

  // 리소스 없음
  if (err.message.includes('Resource not found')) {
    return res.status(404).json({
      code: 404,
      message: 'Resource not found',
      error: 'NOT_FOUND'
    });
  }

  // 네트워크 에러
  if (err.message.includes('Network connection failed')) {
    return res.status(502).json({
      code: 502,
      message: 'Bad gateway',
      error: 'NETWORK_ERROR'
    });
  }

  // 타임아웃 에러
  if (err.message.includes('timeout')) {
    return res.status(504).json({
      code: 504,
      message: 'Gateway timeout',
      error: 'TIMEOUT'
    });
  }

  // 기본 에러 처리
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    code: statusCode,
    message: message,
    error: 'INTERNAL_ERROR'
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Endpoint not found',
    error: 'NOT_FOUND'
  });
};

const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: 'Validation error',
      error: 'VALIDATION_ERROR',
      details: err.details
    });
  }
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  validationErrorHandler
};