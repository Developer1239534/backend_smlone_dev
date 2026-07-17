const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function wipe() {
  try {
    console.log('Fetching all tables in public schema...');
    const res = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    
    const tables = res.rows.map(r => r.tablename);
    
    if (tables.length === 0) {
      console.log('No tables found in public schema.');
      return;
    }
    
    console.log('Tables to wipe:', tables.join(', '));
    
    for (const table of tables) {
      console.log(`Wiping ${table}...`);
      await pool.query(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
    
    console.log('ALL DATA WIPED SUCCESSFULLY!');
  } catch (e) {
    console.error('Error wiping database:', e);
  } finally {
    await pool.end();
    process.exit();
  }
}

wipe();
