const db = require('../src/db/neonClient');

async function recreatePortalTraineeTable() {
  const query = `
    DROP TABLE IF EXISTS portal_trainee CASCADE;

    CREATE TABLE portal_trainee (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255),
      trainee_id VARCHAR(50),
      program VARCHAR(100),
      class VARCHAR(100),
      level VARCHAR(100),
      membership_expired_date DATE,
      latest_speaking_project VARCHAR(255),
      weekly_report_url TEXT,
      referral_code VARCHAR(100),
      progress_video_url TEXT,
      gender VARCHAR(20),
      date_of_birth DATE,
      school_name VARCHAR(255),
      branch_id VARCHAR(50),
      first_enroll DATE,
      newest_grade VARCHAR(100),
      trainee_homeroom VARCHAR(100),
      screening_test_url TEXT,
      speaking_project_to_next_level VARCHAR(255),
      last_life_project_date DATE,
      last_life_project VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_portal_trainee_trainee_id ON portal_trainee(trainee_id);
    CREATE INDEX IF NOT EXISTS idx_portal_trainee_branch_id ON portal_trainee(branch_id);
  `;

  try {
    console.log('🚀 Re-creating table portal_trainee with simplified schema...');
    await db.query(query);
    console.log('✅ Table portal_trainee updated successfully!');
  } catch (error) {
    console.error('❌ Failed to update table portal_trainee:', error);
  } finally {
    process.exit(0);
  }
}

recreatePortalTraineeTable();
