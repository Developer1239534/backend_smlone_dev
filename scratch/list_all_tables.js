const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function listTables() {
  try {
    const res = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    `);
    
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
    process.exit();
  }
}

listTables();
