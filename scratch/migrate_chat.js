const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('BEGIN');

    console.log('Creating chat_messages table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('ADMIN', 'TRAINEE')),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);

    console.log('Creating index on trainee_id for faster lookups...');
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_chat_trainee_id ON chat_messages(trainee_id);
    `;
    await pool.query(createIndexQuery);

    await pool.query('COMMIT');
    console.log('Migration completed successfully!');

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}
main();
