require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function standardizeNamaColumn() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    // If name column exists, copy non-null values to nama if nama is null, then drop name column
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'credential_portal' AND column_name = 'name'
        ) THEN
          UPDATE credential_portal SET nama = name WHERE nama IS NULL OR nama = '';
          ALTER TABLE credential_portal DROP COLUMN name;
        END IF;
      END $$;
    `);

    // Ensure nama exists
    await client.query('ALTER TABLE credential_portal ADD COLUMN IF NOT EXISTS nama VARCHAR(255);');

    console.log('✅ Standarisasi kolom selesai: Menggunakan kolom "nama"!');

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

standardizeNamaColumn();
