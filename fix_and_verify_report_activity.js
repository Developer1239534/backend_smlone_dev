const db = require('./src/db/neonClient');

async function fixAndVerify() {
  try {
    await db.query(`
      ALTER TABLE report_activity 
      ADD COLUMN IF NOT EXISTS speaking_project_to_next_level VARCHAR(50);
    `);

    const sample = await db.query(`
      SELECT 
        trainee_id, name, branch, cleaned_program, cleaned_class, level,
        speaking_project_to_next_level, life_project_to_next_level, last_speaking_project,
        level_up_sp, level_up_lp
      FROM report_activity
      WHERE life_project_to_next_level IS NOT NULL AND life_project_to_next_level != '0%'
      LIMIT 5;
    `);

    console.log('Sample rows with Life Project > 0%:', sample.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

fixAndVerify();
