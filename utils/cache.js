const NodeCache = require('node-cache');
const logger = require('./logger');

/**
 * Enterprise-level caching utility
 * Provides in-memory caching with TTL, statistics, and cache invalidation patterns
 */
class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
      useClones: false,
      deleteOnExpire: true,
      enableLegacyCallbacks: false
    });

    this.shortCache = new NodeCache({
      stdTTL: 60,
      checkperiod: 30,
      useClones: false
    });

    this.longCache = new NodeCache({
      stdTTL: 3600,
      checkperiod: 600,
      useClones: false
    });

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      flushes: 0
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.cache.on('set', (key, value) => {
      this.stats.sets++;
      logger.debug('Cache SET', { key, size: JSON.stringify(value).length });
    });

    this.cache.on('del', (key, value) => {
      this.stats.deletes++;
      logger.debug('Cache DELETE', { key });
    });

    this.cache.on('expired', (key, value) => {
      logger.debug('Cache EXPIRED', { key });
    });

    this.cache.on('flush', () => {
      this.stats.flushes++;
      logger.info('Cache FLUSH');
    });
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @param {string} cacheType - Cache type (default, short, long)
   * @returns {*} Cached value or undefined
   */
  get(key, cacheType = 'default') {
    const cache = this.getCache(cacheType);
    const value = cache.get(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      logger.debug('Cache HIT', { key, cacheType });
      return value;
    } else {
      this.stats.misses++;
      logger.debug('Cache MISS', { key, cacheType });
      return undefined;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @param {string} cacheType - Cache type
   * @returns {boolean} Success status
   */
  set(key, value, ttl = null, cacheType = 'default') {
    const cache = this.getCache(cacheType);
    const success = cache.set(key, value, ttl);
    
    if (success) {
      logger.debug('Cache SET success', { key, cacheType, ttl });
    } else {
      logger.warn('Cache SET failed', { key, cacheType, ttl });
    }
    
    return success;
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @param {string} cacheType - Cache type
   * @returns {number} Number of deleted keys
   */
  del(key, cacheType = 'default') {
    const cache = this.getCache(cacheType);
    return cache.del(key);
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @param {string} cacheType - Cache type
   * @returns {boolean} Key exists
   */
  has(key, cacheType = 'default') {
    const cache = this.getCache(cacheType);
    return cache.has(key);
  }

  /**
   * Get cache instance by type
   * @param {string} cacheType - Cache type
   * @returns {NodeCache} Cache instance
   */
  getCache(cacheType) {
    switch (cacheType) {
      case 'short':
        return this.shortCache;
      case 'long':
        return this.longCache;
      default:
        return this.cache;
    }
  }

  /**
   * Get or set pattern - get from cache or execute function and cache result
   * @param {string} key - Cache key
   * @param {Function} fn - Function to execute if cache miss
   * @param {number} ttl - Time to live
   * @param {string} cacheType - Cache type
   * @returns {*} Cached or computed value
   */
  async getOrSet(key, fn, ttl = null, cacheType = 'default') {
    let value = this.get(key, cacheType);
    
    if (value === undefined) {
      try {
        value = await fn();
        this.set(key, value, ttl, cacheType);
      } catch (error) {
        logger.error('Cache getOrSet function failed', { key, error: error.message });
        throw error;
      }
    }
    
    return value;
  }

  /**
   * Invalidate cache keys by pattern
   * @param {string} pattern - Pattern to match keys
   * @param {string} cacheType - Cache type
   * @returns {number} Number of deleted keys
   */
  invalidatePattern(pattern, cacheType = 'default') {
    const cache = this.getCache(cacheType);
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    if (matchingKeys.length > 0) {
      const deletedCount = cache.del(matchingKeys);
      logger.info('Cache pattern invalidation', { pattern, deletedCount, cacheType });
      return deletedCount;
    }
    
    return 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      keys: {
        default: this.cache.keys().length,
        short: this.shortCache.keys().length,
        long: this.longCache.keys().length
      }
    };
  }

  /**
   * Flush all caches
   */
  flushAll() {
    this.cache.flushAll();
    this.shortCache.flushAll();
    this.longCache.flushAll();
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      flushes: this.stats.flushes + 1
    };
    
    logger.info('All caches flushed');
  }

  /**
   * Generate cache key for tenant data
   * @param {string} operation - Operation type
   * @param {Object} params - Parameters
   * @returns {string} Cache key
   */
  generateTenantKey(operation, params = {}) {
    const baseKey = `tenant:${operation}`;
    if (Object.keys(params).length === 0) return baseKey;
    
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${baseKey}:${paramString}`;
  }

  /**
   * Generate cache key for property data
   * @param {string} operation - Operation type
   * @param {Object} params - Parameters
   * @returns {string} Cache key
   */
  generatePropertyKey(operation, params = {}) {
    const baseKey = `property:${operation}`;
    if (Object.keys(params).length === 0) return baseKey;
    
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${baseKey}:${paramString}`;
  }
}

const cacheManager = new CacheManager();

module.exports = cacheManager;
