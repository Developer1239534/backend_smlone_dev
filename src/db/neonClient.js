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
  max: 20,
  idleTimeoutMillis: 300000, // 5 menit
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

// Prewarm connection pool saat startup
pool.query('SELECT 1')
  .then(() => console.log('⚡ [NeonClient] Connection pool pre-warmed & ready.'))
  .catch((err) => console.warn('⚠️ [NeonClient] Prewarm ping failed:', err.message));

// Keep connection warm: ping berkala tiap 2.5 menit untuk mencegah Neon cold-start
const keepAliveTimer = setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    // silent
  }
}, 150000);
if (keepAliveTimer.unref) keepAliveTimer.unref();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
