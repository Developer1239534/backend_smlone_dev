require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createRealStageTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB / PostgreSQL...');

    // Drop table if exists to ensure clean structure without any primary key conflict
    await client.query('DROP TABLE IF EXISTS real_stage CASCADE;');

    // Create table real_stage with standard 4 columns (without strict PRIMARY KEY constraint so empty/duplicate rows won't error)
    await client.query(`
      CREATE TABLE real_stage (
        "No. Voucher"                 VARCHAR(255),
        "Nama Trainee"                VARCHAR(255),
        "ID Trainee"                  VARCHAR(255),
        "Link Voucher Real Stage"     TEXT
      );
    `);

    console.log('✅ Tabel "real_stage" berhasil dibuat tanpa constraint Primary Key (semua baris bisa masuk lancar)!');

    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'real_stage'
      ORDER BY ordinal_position;
    `);
    console.log('\n📋 Struktur tabel "real_stage" sekarang:');
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createRealStageTable();
