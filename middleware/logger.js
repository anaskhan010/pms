const morgan = require('morgan');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

morgan.token('user-id', (req) => {
  return req.user ? req.user.user_id : 'anonymous';
});

morgan.token('user-role', (req) => {
  return req.user ? req.user.role : 'none';
});

morgan.token('request-id', (req) => {
  return req.requestId || 'unknown';
});

morgan.token('cache-status', (req) => {
  return req.cacheStatus || 'none';
});

const detailedFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :user-role :response-time ms :request-id :cache-status';

const requestLogger = (req, res, next) => {
  req.requestId = require('uuid').v4();

  req.startTime = Date.now();

  req.cacheStatus = 'none';

  logger.debug('Request started', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.user_id,
    userRole: req.user?.role
  });

  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - req.startTime;

    logger.logAPIRequest(req, res, responseTime);

    logger.debug('Request completed', {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      responseSize: JSON.stringify(data).length,
      cacheStatus: req.cacheStatus
    });

    return originalJson.call(this, data);
  };

  next();
};

const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000;

    if (duration > 1000) {
      logger.warn('Slow request detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        userId: req.user?.user_id,
        statusCode: res.statusCode
      });
    }

    const metricsKey = `metrics:${req.method}:${req.route?.path || req.originalUrl}`;
    const existingMetrics = cache.get(metricsKey, 'short') || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0
    };

    existingMetrics.count++;
    existingMetrics.totalTime += duration;
    existingMetrics.avgTime = existingMetrics.totalTime / existingMetrics.count;
    existingMetrics.minTime = Math.min(existingMetrics.minTime, duration);
    existingMetrics.maxTime = Math.max(existingMetrics.maxTime, duration);

    cache.set(metricsKey, existingMetrics, 300, 'short');
  });

  next();
};

const securityLogger = (req, res, next) => {
  const originalStatus = res.status;
  res.status = function(code) {
    if (code === 401) {
      logger.logSecurityEvent('Authentication Failed', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      });
    } else if (code === 403) {
      logger.logSecurityEvent('Authorization Failed', {
        ip: req.ip,
        userId: req.user?.user_id,
        userRole: req.user?.role,
        url: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      });
    } else if (code === 429) {
      logger.logSecurityEvent('Rate Limit Exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      });
    }

    return originalStatus.call(this, code);
  };

  next();
};

module.exports = {
  morganLogger: morgan(detailedFormat, { stream: logger.stream }),
  requestLogger,
  performanceMonitor,
  securityLogger
};
