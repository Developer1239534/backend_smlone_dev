require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createProfileTraineeTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS profile_trainee (
        id                    VARCHAR(255),
        first_name            VARCHAR(255),
        last_name             VARCHAR(255),
        gender                VARCHAR(50),
        date_of_birthday      DATE,
        nama_sekolah          VARCHAR(255),
        kelas                 VARCHAR(100),
        membership            VARCHAR(100),
        start_date            DATE,
        expiry_date           DATE,
        class                 VARCHAR(100),
        house                 VARCHAR(100),
        trainer_homeroom      VARCHAR(255),
        email_account_parents VARCHAR(255),
        nomor_wa_parent       VARCHAR(50),
        nomor_wa_trainee      VARCHAR(50)
      );
    `);

    console.log('✅ Tabel "profile_trainee" berhasil dibuat!');

    // Cek struktur tabel
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'profile_trainee'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Struktur tabel "profile_trainee":');
    console.table(result.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createProfileTraineeTable();
