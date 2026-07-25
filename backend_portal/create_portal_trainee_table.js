const db = require('../src/db/neonClient');

async function createPortalTraineeTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS portal_trainee (
      id BIGSERIAL PRIMARY KEY,
      trainee_id VARCHAR(50),
      student_id VARCHAR(50),
      full_name VARCHAR(255),
      level VARCHAR(100),
      program VARCHAR(100),
      gender VARCHAR(20),
      birth_date DATE,
      school VARCHAR(255),
      newest_grade VARCHAR(100),
      joined_since DATE,
      membership_expiry DATE,
      branch VARCHAR(100),
      parent_whatsapp VARCHAR(20),
      trainee_whatsapp VARCHAR(20),
      last_speaking_project VARCHAR(255),
      last_life_project VARCHAR(255),
      progress_to_next_level NUMERIC(5,2),
      progress_video_url TEXT,
      real_stage_url TEXT,
      weekly_report_url TEXT,
      screening_test_url TEXT,
      quarterly_report_url TEXT,
      voucher_real_stage VARCHAR(100),
      referral_code VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_portal_trainee_trainee_id ON portal_trainee(trainee_id);
    CREATE INDEX IF NOT EXISTS idx_portal_trainee_student_id ON portal_trainee(student_id);
  `;

  try {
    console.log('🚀 Creating table portal_trainee...');
    await db.query(createTableQuery);
    console.log('✅ Table portal_trainee created successfully!');
  } catch (error) {
    console.error('❌ Failed to create table portal_trainee:', error);
  } finally {
    process.exit(0);
  }
}

createPortalTraineeTable();
