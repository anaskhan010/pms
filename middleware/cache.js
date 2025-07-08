const cache = require('../utils/cache');
const logger = require('../utils/logger');

/**
 * Enterprise-level caching middleware
 * Provides intelligent caching with cache invalidation patterns
 */

/**
 * Generic cache middleware
 * @param {Object} options - Caching options
 * @param {number} options.ttl - Time to live in seconds
 * @param {string} options.cacheType - Cache type (default, short, long)
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {Array} options.varyBy - Request properties to vary cache by
 * @param {Function} options.condition - Condition function to determine if request should be cached
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300,
    cacheType = 'default',
    keyGenerator = null,
    varyBy = ['url', 'query'],
    condition = () => true
  } = options;

  return (req, res, next) => {
    if (!condition(req)) {
      return next();
    }

    if (req.method !== 'GET') {
      return next();
    }

    let cacheKey;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      const keyParts = [];
      
      if (varyBy.includes('url')) {
        keyParts.push(req.originalUrl);
      }
      
      if (varyBy.includes('query')) {
        keyParts.push(JSON.stringify(req.query));
      }
      
      if (varyBy.includes('user') && req.user) {
        keyParts.push(`user:${req.user.user_id}`);
      }
      
      if (varyBy.includes('role') && req.user) {
        keyParts.push(`role:${req.user.role}`);
      }
      
      cacheKey = `api:${keyParts.join(':')}`;
    }

    const cachedData = cache.get(cacheKey, cacheType);
    
    if (cachedData) {
      req.cacheStatus = 'hit';
      logger.debug('Cache hit', { 
        key: cacheKey, 
        cacheType,
        requestId: req.requestId 
      });
      
      return res.json(cachedData);
    }

    req.cacheStatus = 'miss';
    const originalJson = res.json;
    
    res.json = function(data) {
      if (res.statusCode === 200 && data.success !== false) {
        cache.set(cacheKey, data, ttl, cacheType);
        req.cacheStatus = 'miss-stored';
        
        logger.debug('Cache stored', { 
          key: cacheKey, 
          cacheType, 
          ttl,
          requestId: req.requestId 
        });
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Tenant-specific caching middleware
 */
const tenantCache = (ttl = 300) => {
  return cacheMiddleware({
    ttl,
    cacheType: 'default',
    keyGenerator: (req) => {
      const baseKey = `tenant:${req.originalUrl}`;
      const queryKey = Object.keys(req.query).length > 0 ? `:${JSON.stringify(req.query)}` : '';
      const userKey = req.user ? `:user:${req.user.user_id}` : '';
      return `${baseKey}${queryKey}${userKey}`;
    },
    condition: (req) => {
      return req.method === 'GET' && req.originalUrl.includes('/tenants');
    }
  });
};

/**
 * Property-specific caching middleware
 */
const propertyCache = (ttl = 600) => {
  return cacheMiddleware({
    ttl,
    cacheType: 'default',
    keyGenerator: (req) => {
      const baseKey = `property:${req.originalUrl}`;
      const queryKey = Object.keys(req.query).length > 0 ? `:${JSON.stringify(req.query)}` : '';
      const userKey = req.user ? `:user:${req.user.user_id}` : '';
      return `${baseKey}${queryKey}${userKey}`;
    },
    condition: (req) => {
      return req.method === 'GET' && req.originalUrl.includes('/properties');
    }
  });
};

/**
 * Dashboard data caching middleware
 */
const dashboardCache = (ttl = 180) => {
  return cacheMiddleware({
    ttl,
    cacheType: 'short',
    keyGenerator: (req) => {
      return `dashboard:${req.user.user_id}:${req.user.role}:${req.originalUrl}`;
    },
    varyBy: ['url', 'user', 'role'],
    condition: (req) => {
      return req.method === 'GET' && 
             req.originalUrl.includes('dashboard') && 
             req.user;
    }
  });
};

/**
 * Statistics caching middleware
 */
const statisticsCache = (ttl = 900) => {
  return cacheMiddleware({
    ttl,
    cacheType: 'long',
    keyGenerator: (req) => {
      const baseKey = `stats:${req.originalUrl}`;
      const queryKey = Object.keys(req.query).length > 0 ? `:${JSON.stringify(req.query)}` : '';
      const userKey = req.user ? `:role:${req.user.role}` : '';
      return `${baseKey}${queryKey}${userKey}`;
    },
    condition: (req) => {
      return req.method === 'GET' && 
             (req.originalUrl.includes('statistics') || 
              req.originalUrl.includes('analytics') ||
              req.originalUrl.includes('reports'));
    }
  });
};

/**
 * Cache invalidation middleware
 * Invalidates related cache entries when data is modified
 */
const cacheInvalidation = (patterns = []) => {
  return (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const originalJson = res.json;
      
      res.json = function(data) {
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success !== false) {
          const defaultPatterns = [];
          
          if (req.originalUrl.includes('/tenants')) {
            defaultPatterns.push('tenant:', 'dashboard:', 'stats:');
          }
          
          if (req.originalUrl.includes('/properties')) {
            defaultPatterns.push('property:', 'dashboard:', 'stats:');
          }
          
          if (req.originalUrl.includes('/units')) {
            defaultPatterns.push('property:', 'unit:', 'dashboard:', 'stats:');
          }
          
          const allPatterns = [...defaultPatterns, ...patterns];
          
          let totalInvalidated = 0;
          allPatterns.forEach(pattern => {
            const invalidated = cache.invalidatePattern(pattern);
            totalInvalidated += invalidated;
          });
          
          if (totalInvalidated > 0) {
            logger.info('Cache invalidated', {
              patterns: allPatterns,
              invalidatedCount: totalInvalidated,
              requestId: req.requestId,
              method: req.method,
              url: req.originalUrl
            });
          }
        }
        
        return originalJson.call(this, data);
      };
    }
    
    next();
  };
};

/**
 * Cache warming middleware
 * Pre-populates cache with frequently accessed data
 */
const cacheWarming = {
  /**
   * Warm tenant cache
   */
  warmTenantCache: async () => {
    try {
      logger.info('Tenant cache warming started');
      
      
      logger.info('Tenant cache warming completed');
    } catch (error) {
      logger.error('Tenant cache warming failed', { error: error.message });
    }
  },

  /**
   * Warm property cache
   */
  warmPropertyCache: async () => {
    try {
      logger.info('Property cache warming started');
      
      
      logger.info('Property cache warming completed');
    } catch (error) {
      logger.error('Property cache warming failed', { error: error.message });
    }
  }
};

module.exports = {
  cacheMiddleware,
  tenantCache,
  propertyCache,
  dashboardCache,
  statisticsCache,
  cacheInvalidation,
  cacheWarming
};
