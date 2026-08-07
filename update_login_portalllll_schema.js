const db = require('./src/db/neonClient');

async function updateSchema() {
  try {
    console.log('🔄 Recreating login_portalllll table with updated columns...');
    await db.query('DROP TABLE IF EXISTS login_portalllll CASCADE;');
    await db.query(`
      CREATE TABLE login_portalllll (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        gender VARCHAR(50),
        date_of_birth DATE,
        nama_sekolah VARCHAR(255),
        cleaned_program VARCHAR(100),
        membership VARCHAR(100),
        expiry_date DATE,
        cabang_id VARCHAR(100),
        first_enroll DATE,
        class_name VARCHAR(255),
        house VARCHAR(255),
        level VARCHAR(100),
        house_role VARCHAR(100),
        cabang_kelas VARCHAR(100),
        newest_grade VARCHAR(100),
        trainee_homeroom VARCHAR(100),
        screening_test VARCHAR(100),
        draft_grade VARCHAR(100),
        prev_grade VARCHAR(100),
        ajy_by_class VARCHAR(100),
        last_real_stage VARCHAR(100),
        password VARCHAR(255),
        plain_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_login_portalllll_membership ON login_portalllll(membership);
      CREATE INDEX IF NOT EXISTS idx_login_portalllll_name ON login_portalllll(name);
    `);
    console.log('✅ Table login_portalllll recreated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  }
}

updateSchema();
