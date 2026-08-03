const db = require('../src/db/neonClient');

async function run() {
  console.log('🚀 Connecting to Neon PostgreSQL...');
  try {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS login_portal_fix (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        gender VARCHAR(50),
        date_of_birth DATE,
        nama_sekolah VARCHAR(255),
        cleaned_program VARCHAR(100),
        membership VARCHAR(100),
        expiry_date DATE,
        cabang_id VARCHAR(50),
        first_enroll DATE,
        class VARCHAR(100),
        house VARCHAR(100),
        level VARCHAR(100),
        house_role VARCHAR(100),
        cabang_kelas VARCHAR(100),
        newest_grade VARCHAR(100),
        trainee_homeroom VARCHAR(255),
        screening_test VARCHAR(100),
        draft_grade VARCHAR(100),
        prev_grade VARCHAR(100),
        ajy_by_class VARCHAR(100),
        last_real_stage VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.query(createTableSql);
    console.log('✅ SUCCESS: Table `login_portal_fix` created successfully in Neon Database!');

    const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📋 Current tables in database:', tables.rows.map(r => r.table_name));

    // Inspect columns of login_portal_fix
    const cols = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'login_portal_fix'");
    console.log('🔍 Columns of login_portal_fix:', cols.rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err);
    process.exit(1);
  }
}

run();
