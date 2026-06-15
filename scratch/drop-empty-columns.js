require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('🔌 Connecting to Neon database for DDL operations...');

    const dropQuery = `
      ALTER TABLE dashboard_trainne 
        DROP COLUMN IF EXISTS quarterly_report CASCADE,
        DROP COLUMN IF EXISTS laporan_terkini CASCADE,
        DROP COLUMN IF EXISTS laporan_sebelumnya CASCADE,
        DROP COLUMN IF EXISTS laporan_quarter_sebelumnya CASCADE,
        DROP COLUMN IF EXISTS highlight_terbaru CASCADE,
        DROP COLUMN IF EXISTS progress_ke_next_level CASCADE,
        DROP COLUMN IF EXISTS pengumuman CASCADE,
        DROP COLUMN IF EXISTS completed_speaking_project CASCADE;
    `;
    
    await pool.query(dropQuery);
    console.log('🎉 Successfully dropped the 8 empty columns from dashboard_trainne!');

  } catch (err) {
    console.error('❌ DDL execution failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();
