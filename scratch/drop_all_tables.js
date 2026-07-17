const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function dropAllTables() {
  try {
    console.log('Fetching all tables in public schema...');
    const res = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    
    const tables = res.rows.map(r => r.tablename);
    
    if (tables.length === 0) {
      console.log('No tables found to drop. Database is completely empty.');
      return;
    }
    
    console.log('Tables to DROP:', tables.join(', '));
    
    for (const table of tables) {
      console.log(`Dropping table ${table}...`);
      await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    }
    
    console.log('ALL TABLES HAVE BEEN COMPLETELY DROPPED!');
  } catch (e) {
    console.error('Error dropping tables:', e);
  } finally {
    await pool.end();
    process.exit();
  }
}

dropAllTables();
