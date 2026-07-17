const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function dropNeonAuthTables() {
  try {
    const res = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'neon_auth';
    `);
    
    const tables = res.rows.map(r => r.tablename);
    
    if (tables.length === 0) {
      console.log('No tables found in neon_auth schema.');
      return;
    }
    
    console.log('Tables to DROP in neon_auth:', tables.join(', '));
    
    for (const table of tables) {
      console.log(`Dropping neon_auth.${table}...`);
      await pool.query(`DROP TABLE IF EXISTS "neon_auth"."${table}" CASCADE;`);
    }
    
    console.log('ALL NEON AUTH TABLES DROPPED!');
  } catch (e) {
    console.error('Error dropping neon_auth tables:', e);
  } finally {
    await pool.end();
    process.exit();
  }
}

dropNeonAuthTables();
