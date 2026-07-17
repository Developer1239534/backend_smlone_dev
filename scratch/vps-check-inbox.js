const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const query = `
      SELECT 
        c.trainee_id, 
        d.trainee_name as fullname, 
        MAX(c.created_at) as last_message_time,
        (SELECT message FROM chat_messages c2 WHERE c2.trainee_id = c.trainee_id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_messages c
      JOIN dashboard_trainne d ON c.trainee_id = d.id
      GROUP BY c.trainee_id, d.trainee_name
      ORDER BY last_message_time DESC;
    `;
    const res = await pool.query(query);
    console.log('INBOX RESULT:', res.rows);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    pool.end();
  }
}
check();
