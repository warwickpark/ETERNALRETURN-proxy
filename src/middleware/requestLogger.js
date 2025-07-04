const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('content-length')
    };

    if (res.statusCode >= 400) {
      logger.error('Request failed:', logData);
    } else {
      logger.info('Request completed:', logData);
    }
  });

  next();
};

module.exports = requestLogger;