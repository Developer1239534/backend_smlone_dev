require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetProfileTraineeTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    // Drop table and recreate with exact requested columns
    await client.query('DROP TABLE IF EXISTS profile_trainee CASCADE;');

    await client.query(`
      CREATE TABLE profile_trainee (
        id                    VARCHAR(255) PRIMARY KEY,
        nama                  VARCHAR(255),
        gender                VARCHAR(50),
        membership            VARCHAR(100),
        start_date            DATE,
        expiry_date           DATE,
        class                 VARCHAR(100),
        house                 VARCHAR(100),
        trainer_homeroom      VARCHAR(255),
        date_of_birthday      DATE,
        kelas                 VARCHAR(100),
        email_account_parents VARCHAR(255),
        nomor_wa_parent       VARCHAR(50),
        nomor_wa_trainee      VARCHAR(50),
        nama_sekolah          VARCHAR(255)
      );
    `);

    console.log('✅ Tabel "profile_trainee" berhasil di-reset dengan 15 kolom eksak!');

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

resetProfileTraineeTable();
