const db = require('./src/db/neonClient');
const fs = require('fs');

async function syncAllFields() {
  try {
    console.log('Ensuring all columns exist on report_activity...');
    await db.query(`
      ALTER TABLE report_activity 
      DROP COLUMN IF EXISTS level_up_checklist;
      
      ALTER TABLE report_activity 
      ADD COLUMN IF NOT EXISTS speaking_project_to_next_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS life_project_to_next_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS last_speaking_project VARCHAR(100),
      ADD COLUMN IF NOT EXISTS level_up_sp VARCHAR(100),
      ADD COLUMN IF NOT EXISTS level_up_lp VARCHAR(100);
    `);

    // 1. Sync level_up_sp from speaking_project_to_next_level
    await db.query(`
      UPDATE report_activity 
      SET level_up_sp = speaking_project_to_next_level 
      WHERE speaking_project_to_next_level IS NOT NULL AND level_up_sp IS NULL;
    `);

    // 2. Sync level_up_lp from life_project_to_next_level
    await db.query(`
      UPDATE report_activity 
      SET level_up_lp = life_project_to_next_level 
      WHERE life_project_to_next_level IS NOT NULL AND level_up_lp IS NULL;
    `);

    console.log('Fields synchronized!');

    // Verify sample
    const sample = await db.query(`
      SELECT 
        trainee_id, name, branch, cleaned_program, cleaned_class, level,
        speaking_project_to_next_level, life_project_to_next_level, last_speaking_project,
        level_up_sp, level_up_lp
      FROM report_activity
      ORDER BY trainee_id ASC
      LIMIT 10;
    `);

    console.log('Sample report_activity rows:', JSON.stringify(sample.rows, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

syncAllFields();
