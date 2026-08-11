require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function updateProfileTraineeTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS profile_trainee (
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

    // Ensure all columns exist
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS nama VARCHAR(255);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS gender VARCHAR(50);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS membership VARCHAR(100);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS start_date DATE;');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS expiry_date DATE;');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS class VARCHAR(100);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS house VARCHAR(100);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS trainer_homeroom VARCHAR(255);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS date_of_birthday DATE;');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS kelas VARCHAR(100);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS email_account_parents VARCHAR(255);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS nomor_wa_parent VARCHAR(50);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS nomor_wa_trainee VARCHAR(50);');
    await client.query('ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS nama_sekolah VARCHAR(255);');

    console.log('✅ Tabel "profile_trainee" berhasil di-setup!');

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

updateProfileTraineeTable();
