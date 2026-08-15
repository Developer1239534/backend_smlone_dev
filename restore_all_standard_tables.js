const db = require('./src/db/neonClient');

async function restoreStandardTables() {
  try {
    console.log('🔄 Restoring standard production database structure...');

    // 1. profile_trainee
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_trainee (
        trainee_id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        personal_email VARCHAR(255),
        school VARCHAR(255),
        birthday VARCHAR(100),
        trainee_wa_number VARCHAR(100),
        parent_wa_number VARCHAR(100),
        house VARCHAR(100),
        house_role VARCHAR(100),
        membership_status VARCHAR(100),
        first_enroll VARCHAR(100),
        membership_expired_date VARCHAR(100),
        class_name VARCHAR(255),
        level VARCHAR(100),
        newest_grade VARCHAR(100),
        branch VARCHAR(100),
        room VARCHAR(100),
        day VARCHAR(100),
        time VARCHAR(100),
        trainer VARCHAR(100),
        trainee_homeroom VARCHAR(255),
        homeroom_kelas VARCHAR(255),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. house_rank
    await db.query(`
      CREATE TABLE IF NOT EXISTS house_rank (
        "Nama House" VARCHAR(255),
        "Total Gold" INT DEFAULT 0,
        "Class" VARCHAR(255),
        "Cabang" VARCHAR(255),
        "Program" VARCHAR(255),
        "Rank" INT
      );
    `);

    // 3. credential_portal
    await db.query(`
      CREATE TABLE IF NOT EXISTS credential_portal (
        student_id VARCHAR(100) PRIMARY KEY,
        student_name VARCHAR(255),
        class VARCHAR(255),
        whatsapp VARCHAR(100),
        referral_code VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. monthly_gold_point
    await db.query(`
      CREATE TABLE IF NOT EXISTS monthly_gold_point (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(100),
        name VARCHAR(255),
        gold_point INT DEFAULT 0,
        month VARCHAR(50),
        year INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Drop unused test tables if any exist
    await db.query('DROP TABLE IF EXISTS gold_poin_setahun;');
    await db.query('DROP TABLE IF EXISTS ranking_house;');

    const listRes = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('✅ Standard production tables in Neon DB:');
    for (const row of listRes.rows) {
      const cntRes = await db.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`  - ${row.table_name}: ${cntRes.rows[0].count} rows`);
    }

  } catch (err) {
    console.error('Error restoring tables:', err);
  } finally {
    process.exit(0);
  }
}

restoreStandardTables();
