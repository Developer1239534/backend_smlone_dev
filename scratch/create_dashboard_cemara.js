const db = require('../src/db/neonClient');

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS dashboard_cemara (
        id SERIAL PRIMARY KEY,
        trainee_id TEXT UNIQUE,
        full_name TEXT,
        gender TEXT,
        birth_date TEXT,
        school TEXT,
        learning_program TEXT,
        membership TEXT,
        expiry_date TEXT,
        branch TEXT,
        enrollment_date TEXT,
        class TEXT,
        house TEXT,
        level TEXT,
        house_role TEXT,
        class_branch TEXT,
        current_grade TEXT,
        homeroom TEXT,
        screening_status TEXT,
        draft_grade TEXT,
        previous_grade TEXT,
        class_category TEXT,
        current_stage TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Successfully created dashboard_cemara table in database.');
  } catch (e) {
    console.error('Error creating table:', e.message);
  }
  process.exit(0);
}

createTable();
