const db = require('./src/db/neonClient');

async function createFeedbackTable() {
  try {
    console.log('🔄 Creating table "feedback" in Neon PostgreSQL...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(100),
        student_name VARCHAR(255),
        house VARCHAR(255),
        class_trainers VARCHAR(255),
        date DATE,
        coach_feedback TEXT,
        challenge TEXT,
        speaking_project TEXT,
        role_2 VARCHAR(255),
        role_3 VARCHAR(255),
        role_4 VARCHAR(255),
        life_project TEXT,
        win VARCHAR(255),
        fav VARCHAR(255),
        total_gold INTEGER DEFAULT 0,
        level VARCHAR(100),
        latest_speaking_project TEXT,
        last_time_speaking VARCHAR(255),
        class_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_feedback_trainee_id ON feedback(trainee_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_student_name ON feedback(student_name);
    `);
    console.log('✅ Table "feedback" created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating feedback table:', err);
    process.exit(1);
  }
}

createFeedbackTable();
