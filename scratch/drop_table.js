const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function dropTable() {
  try {
    console.log('Dropping table voucher_realstage...');
    await pool.query('DROP TABLE IF EXISTS voucher_realstage CASCADE;');
    console.log('Table voucher_realstage has been successfully DROPPED!');
  } catch (e) {
    console.error('Error dropping table:', e);
  } finally {
    await pool.end();
    process.exit();
  }
}

dropTable();
