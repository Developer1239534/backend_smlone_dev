require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetProfileTraineeExactColumns() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query('DROP TABLE IF EXISTS profile_trainee CASCADE;');

    // Create table with exact quoted column names without underscores
    await client.query(`
      CREATE TABLE profile_trainee (
        "ID"                    VARCHAR(255) PRIMARY KEY,
        "Nama"                  VARCHAR(255),
        "Gender"                VARCHAR(50),
        "Membership"            VARCHAR(100),
        "Start Date"            TEXT,
        "Expiry Date"           TEXT,
        "Class"                 VARCHAR(100),
        "House"                 VARCHAR(100),
        "Trainer Homeroom"      VARCHAR(255),
        "Date of Birthday"      TEXT,
        "Kelas"                 VARCHAR(100),
        "Email Account Parents" VARCHAR(255),
        "Nomor WA Parent"       VARCHAR(100),
        "Nomor WA Trainee"      VARCHAR(100),
        "Nama Sekolah"          VARCHAR(255)
      );
    `);

    console.log('✅ Tabel "profile_trainee" berhasil dibuat dengan nama kolom eksak tanpa underscore!');

    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'profile_trainee'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Struktur tabel "profile_trainee" sekarang:');
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetProfileTraineeExactColumns();
