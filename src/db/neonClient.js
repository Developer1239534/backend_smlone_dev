const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️  WARNING: DATABASE_URL is not set in .env file!');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Tuned pool limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Real-time Database Metrics Tracking
const dbMetrics = {
  totalQueries: 0,
  totalQueryTimeMs: 0,
  slowQueriesCount: 0,
  slowQueriesLog: [],
};

/**
 * Optimized query wrapper with performance timing and slow query logging (> 200ms)
 */
const query = async (text, params) => {
  const start = Date.now();
  dbMetrics.totalQueries++;

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    dbMetrics.totalQueryTimeMs += duration;

    if (duration > 200) {
      dbMetrics.slowQueriesCount++;
      const logEntry = {
        sql: typeof text === 'string' ? text.slice(0, 150) : 'N/A',
        durationMs: duration,
        timestamp: new Date().toISOString(),
      };
      dbMetrics.slowQueriesLog.unshift(logEntry);
      if (dbMetrics.slowQueriesLog.length > 50) {
        dbMetrics.slowQueriesLog.pop();
      }
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️ [SLOW QUERY] ${duration}ms - Query: ${logEntry.sql}...`);
      }
    }

    return res;
  } catch (err) {
    const duration = Date.now() - start;
    dbMetrics.totalQueryTimeMs += duration;
    console.error(`❌ [DB QUERY ERROR] ${err.message} - Query: ${typeof text === 'string' ? text.slice(0, 120) : 'N/A'}`);
    throw err;
  }
};

const getDbMetrics = () => {
  const avgQueryTimeMs = dbMetrics.totalQueries > 0 
    ? (dbMetrics.totalQueryTimeMs / dbMetrics.totalQueries).toFixed(2) 
    : 0;
  return {
    totalQueries: dbMetrics.totalQueries,
    totalQueryTimeMs: dbMetrics.totalQueryTimeMs,
    avgQueryTimeMs: parseFloat(avgQueryTimeMs),
    slowQueriesCount: dbMetrics.slowQueriesCount,
    recentSlowQueries: dbMetrics.slowQueriesLog.slice(0, 10),
  };
};

module.exports = {
  query,
  pool,
  getDbMetrics,
};
