require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createMonthlyGoldPointTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query('DROP TABLE IF EXISTS monthly_gold_point CASCADE;');

    // Create table monthly_gold_point with exact column names from payload
    await client.query(`
      CREATE TABLE monthly_gold_point (
        "ID"                 VARCHAR(255) PRIMARY KEY,
        "Nama Trainee"       VARCHAR(255),
        "Active/Expired"     VARCHAR(100),
        "Level"              VARCHAR(100),
        "House"              VARCHAR(100),
        "Class"              VARCHAR(100),
        "Branch"             VARCHAR(100),
        "Total Gold/Periode" VARCHAR(100),
        "Junior/Youth"       VARCHAR(100),
        "RANK/ID"            VARCHAR(255)
      );
    `);

    console.log('✅ Tabel "monthly_gold_point" berhasil dibuat!');

    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'monthly_gold_point'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Struktur tabel "monthly_gold_point" sekarang:');
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createMonthlyGoldPointTable();
