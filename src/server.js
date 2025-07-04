const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./utils/logger');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler, validationErrorHandler } = require('./middleware/errorHandler');
const cacheService = require('./services/cache');
const queueService = require('./services/queue');

class Server {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  setupMiddlewares() {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
    
    // CORS 설정 강화
    this.app.use(cors({
      origin: function (origin, callback) {
        // 프로덕션에서는 허용된 도메인만 접근 가능
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
        
        if (config.server.env === 'development') {
          callback(null, true);
        } else if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400 // 24시간
    }));

    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        code: 429,
        message: 'Too many requests from this IP',
        error: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Request logging
    this.app.use(requestLogger);

    // Trust proxy
    this.app.set('trust proxy', 1);
  }

  setupRoutes() {
    // API routes
    this.app.use('/', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'BSER Cache Proxy',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
      });
    });
  }

  setupErrorHandlers() {
    // Validation error handler
    this.app.use(validationErrorHandler);

    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Initialize services
      await this.initializeServices();

      // Start server
      this.server = this.app.listen(config.server.port, () => {
        logger.info(`Server running on port ${config.server.port}`);
        logger.info(`Environment: ${config.server.env}`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

      // Cleanup interval
      this.setupCleanupInterval();

    } catch (error) {
      logger.error('Server startup failed:', error);
      process.exit(1);
    }
  }

  async initializeServices() {
    try {
      // Connect to cache
      await cacheService.connect();
      
      // Initialize queue
      await queueService.initialize();

      logger.info('All services initialized successfully');
    } catch (error) {
      logger.error('Service initialization failed:', error);
      throw error;
    }
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP server closed');
          
          try {
            // Close services
            if (cacheService.redis) {
              await cacheService.redis.quit();
            }
            
            if (queueService.apiQueue) {
              await queueService.apiQueue.close();
            }
            
            logger.info('All services closed');
            process.exit(0);
          } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
          }
        });
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  setupCleanupInterval() {
    // Queue cleanup every 5 minutes
    setInterval(async () => {
      try {
        await queueService.cleanup();
      } catch (error) {
        logger.error('Queue cleanup error:', error);
      }
    }, 5 * 60 * 1000);
  }
}

// Create and start server
const server = new Server();
server.start().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = server;