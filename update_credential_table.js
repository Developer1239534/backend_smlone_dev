require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function updateCredentialTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS credential (
        id VARCHAR(255) PRIMARY KEY,
        nama VARCHAR(255),
        membership_status VARCHAR(255),
        password VARCHAR(255)
      );
    `);

    // Add columns if they don't exist yet
    await client.query('ALTER TABLE credential ADD COLUMN IF NOT EXISTS nama VARCHAR(255);');
    await client.query('ALTER TABLE credential ADD COLUMN IF NOT EXISTS name VARCHAR(255);');
    await client.query('ALTER TABLE credential ADD COLUMN IF NOT EXISTS membership_status VARCHAR(255);');
    await client.query('ALTER TABLE credential ADD COLUMN IF NOT EXISTS password VARCHAR(255);');

    console.log('✅ Tabel "credential" berhasil diupdate!');

    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'credential'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Struktur tabel "credential" sekarang:');
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateCredentialTable();
