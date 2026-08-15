const db = require('./src/db/neonClient');

async function recreateProfileTrainee() {
  try {
    console.log('🔄 Recreating profile_trainee table with 15 exact column names...');

    // Drop table if exists to match exact schema requested
    await db.query('DROP TABLE IF EXISTS profile_trainee CASCADE;');

    // Create table with 15 exact columns requested
    await db.query(`
      CREATE TABLE profile_trainee (
        "ID" VARCHAR(255) PRIMARY KEY,
        "Nama" VARCHAR(255),
        "Gender" VARCHAR(50),
        "Membership" VARCHAR(100),
        "Start Date" VARCHAR(100),
        "Expiry Date" VARCHAR(100),
        "Class" VARCHAR(255),
        "House" VARCHAR(100),
        "Trainer Homeroom" VARCHAR(255),
        "Date of Birthday" VARCHAR(100),
        "Kelas" VARCHAR(255),
        "Email Account Parents" VARCHAR(255),
        "Nomor WA Parent" VARCHAR(100),
        "Nomor WA Trainee" VARCHAR(100),
        "Nama Sekolah" VARCHAR(255)
      );
    `);

    console.log('✅ Table "profile_trainee" successfully created with 15 exact columns!');

    const colsRes = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profile_trainee' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Columns in "profile_trainee":');
    colsRes.rows.forEach(r => console.log(`  - "${r.column_name}" (${r.data_type})`));
  } catch (err) {
    console.error('Error recreating profile_trainee:', err);
  } finally {
    process.exit(0);
  }
}

recreateProfileTrainee();
