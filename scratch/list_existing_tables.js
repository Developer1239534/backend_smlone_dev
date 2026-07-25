const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/ASUS ROG/.gemini/antigravity/scratch/backend_smlone_dev/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function listTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Existing tables in DB:');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    await pool.end();
  }
}

listTables();
