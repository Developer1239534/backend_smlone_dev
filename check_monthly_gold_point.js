require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkAndAlignMonthlyGoldPoint() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query('DROP TABLE IF EXISTS monthly_gold_point CASCADE;');

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

    console.log('✅ Tabel "monthly_gold_point" dikonfirmasi dengan 10 kolom eksak!');

    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'monthly_gold_point'
      ORDER BY ordinal_position
    `);
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndAlignMonthlyGoldPoint();
