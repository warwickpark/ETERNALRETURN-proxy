const winston = require('winston');
const config = require('../config');

// 민감한 정보 필터링
const sensitiveDataFilter = winston.format((info) => {
  // API 키, 비밀번호 등 민감한 정보 마스킹
  const sensitiveKeys = ['password', 'apikey', 'api_key', 'token', 'secret', 'auth'];
  
  function maskSensitiveData(obj) {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[MASKED]';
        } else if (typeof obj[key] === 'object') {
          maskSensitiveData(obj[key]);
        }
      }
    }
    return obj;
  }

  // 메시지에서 민감한 정보 마스킹
  if (typeof info.message === 'string') {
    sensitiveKeys.forEach(key => {
      const regex = new RegExp(`(${key}[=:]\\s*)[^\\s&]+`, 'gi');
      info.message = info.message.replace(regex, '$1[MASKED]');
    });
  }

  // 메타데이터에서 민감한 정보 마스킹
  maskSensitiveData(info);
  
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (config.server.env === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    sensitiveDataFilter(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'bser-cache-proxy',
    environment: config.server.env,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

if (config.server.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;