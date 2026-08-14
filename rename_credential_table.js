require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function renameTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    // Rename table credential to credential_portal if it exists
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'credential') THEN
          ALTER TABLE credential RENAME TO credential_portal;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS credential_portal (
        id                VARCHAR(255) PRIMARY KEY,
        nama              VARCHAR(255),
        name              VARCHAR(255),
        membership_status VARCHAR(255),
        password          VARCHAR(255)
      );
    `);

    console.log('✅ Tabel berhasil diubah nama menjadi "credential_portal"!');

    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'credential_portal'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Struktur tabel "credential_portal" sekarang:');
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

renameTable();
