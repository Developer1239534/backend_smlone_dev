require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createCredentialTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS credential (
        id   VARCHAR(255),
        password VARCHAR(255)
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ Tabel "credential" berhasil dibuat (atau sudah ada)!');

    // Cek kolom yang ada di tabel
    const checkQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'credential'
      ORDER BY ordinal_position;
    `;
    const result = await client.query(checkQuery);
    console.log('\n📋 Struktur tabel "credential":');
    console.table(result.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createCredentialTable();
