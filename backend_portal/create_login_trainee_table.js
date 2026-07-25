const db = require('../src/db/neonClient');
const bcrypt = require('bcryptjs');

async function createLoginTraineeTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS login_trainee (
      id BIGSERIAL PRIMARY KEY,
      student_id VARCHAR(50) UNIQUE NOT NULL REFERENCES portal_trainee(trainee_id) ON DELETE CASCADE ON UPDATE CASCADE,
      password VARCHAR(255) NOT NULL,
      plain_password VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_login_trainee_student_id ON login_trainee(student_id);
  `;

  try {
    console.log('🚀 Creating table login_trainee...');
    await db.query(query);
    console.log('✅ Table login_trainee created successfully!');

    // Auto-sync initial passwords for all existing trainees in portal_trainee
    console.log('🔄 Syncing default passwords (SML + ID) for all existing trainees...');
    const trainees = await db.query(`SELECT trainee_id FROM portal_trainee`);
    
    let count = 0;
    for (const t of trainees.rows) {
      const studentId = t.trainee_id;
      const defaultPassword = `SML${studentId}`;
      const hash = await bcrypt.hash(defaultPassword, 10);

      await db.query(`
        INSERT INTO login_trainee (student_id, password, plain_password)
        VALUES ($1, $2, $3)
        ON CONFLICT (student_id) DO NOTHING
      `, [studentId, hash, defaultPassword]);
      count++;
    }

    console.log(`✅ Default login accounts prepared for ${count} trainees!`);
  } catch (error) {
    console.error('❌ Error creating/syncing login_trainee table:', error);
  } finally {
    process.exit(0);
  }
}

createLoginTraineeTable();
