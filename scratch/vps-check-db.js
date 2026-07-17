const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const tableRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages'");
    if (tableRes.rowCount === 0) {
      console.log('TABLE chat_messages DOES NOT EXIST!');
      return;
    }
    
    const msgRes = await pool.query("SELECT * FROM chat_messages");
    console.log('MESSAGES:', msgRes.rows);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    pool.end();
  }
}
check();
