const crypto = require('crypto');

// In-Memory Storage & Single-Flight Queue
const memoryStore = new Map();
const inFlightRequests = new Map();

// Real-time Cache Metrics
const cacheMetrics = {
  totalRequests: 0,
  hits: 0,
  misses: 0,
  deduplicatedRequests: 0,
  notModified304Count: 0,
  savedBandwidthBytes: 0,
};

// Generate ETag hash from body object/buffer
const generateETag = (body) => {
  const str = typeof body === 'string' ? body : JSON.stringify(body);
  return `W/"${crypto.createHash('md5').update(str).digest('hex')}"`;
};

/**
 * Smart Caching Middleware with ETag, 304 Not Modified, Single-Flight Deduplication & TTL.
 * @param {number} ttlSeconds TTL in seconds (default 300 = 5 minutes).
 */
const cacheMiddleware = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    cacheMetrics.totalRequests++;
    const key = req.originalUrl || req.url;

    // Check ETag 304 & Cached Entry
    const cached = memoryStore.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      cacheMetrics.hits++;
      const clientETag = req.headers['if-none-match'];

      res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, must-revalidate`);
      res.setHeader('ETag', cached.etag);
      res.setHeader('X-Cache', 'HIT');

      // HTTP 304 Not Modified Evaluation
      if (clientETag && clientETag === cached.etag) {
        cacheMetrics.notModified304Count++;
        cacheMetrics.savedBandwidthBytes += (cached.bodySize || 0);
        return res.status(304).end();
      }

      return res.json(cached.body);
    }

    // Single-Flight Request Deduplication: Combine concurrent in-flight requests
    if (inFlightRequests.has(key)) {
      cacheMetrics.deduplicatedRequests++;
      return inFlightRequests.get(key)
        .then(({ status, body, etag }) => {
          res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, must-revalidate`);
          res.setHeader('ETag', etag);
          res.setHeader('X-Cache', 'DEDUPLICATED');
          res.status(status).json(body);
        })
        .catch(next);
    }

    cacheMetrics.misses++;

    // Create Single-Flight Promise for concurrent request batching
    let resolveInFlight;
    let rejectInFlight;
    const inFlightPromise = new Promise((resolve, reject) => {
      resolveInFlight = resolve;
      rejectInFlight = reject;
    });
    inFlightRequests.set(key, inFlightPromise);

    // Intercept res.json to capture response, set headers, and populate cache
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      inFlightRequests.delete(key);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        const etag = generateETag(body);
        const bodyStr = JSON.stringify(body);
        const bodySize = Buffer.byteLength(bodyStr);

        memoryStore.set(key, {
          body,
          etag,
          bodySize,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });

        res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, must-revalidate`);
        res.setHeader('ETag', etag);
        res.setHeader('X-Cache', 'MISS');

        resolveInFlight({ status: res.statusCode, body, etag });
      } else {
        resolveInFlight({ status: res.statusCode, body });
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate cached keys matching a string prefix or RegExp pattern
 */
const invalidateCache = (pattern) => {
  if (!pattern) {
    memoryStore.clear();
    return;
  }
  for (const key of memoryStore.keys()) {
    if (typeof pattern === 'string' ? key.startsWith(pattern) : pattern.test(key)) {
      memoryStore.delete(key);
    }
  }
};

/**
 * Get real-time cache performance metrics
 */
const getCacheMetrics = () => {
  const hitRatioPct = cacheMetrics.totalRequests > 0 
    ? ((cacheMetrics.hits / cacheMetrics.totalRequests) * 100).toFixed(2) 
    : 0;

  return {
    totalRequests: cacheMetrics.totalRequests,
    hits: cacheMetrics.hits,
    misses: cacheMetrics.misses,
    deduplicatedRequests: cacheMetrics.deduplicatedRequests,
    notModified304Count: cacheMetrics.notModified304Count,
    hitRatioPercent: parseFloat(hitRatioPct),
    savedBandwidthBytes: cacheMetrics.savedBandwidthBytes,
    activeCachedKeys: memoryStore.size,
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  getCacheMetrics,
};
