const db = require('./src/db/neonClient');

async function finalVerify() {
  try {
    const total = await db.query(`SELECT COUNT(*) FROM report_activity;`);
    const countLp = await db.query(`SELECT COUNT(*) FROM report_activity WHERE life_project_to_next_level IS NOT NULL;`);
    const countSp = await db.query(`SELECT COUNT(*) FROM report_activity WHERE level_up_sp IS NOT NULL;`);

    const cols = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'report_activity' 
      ORDER BY ordinal_position;
    `);

    const sample = await db.query(`
      SELECT 
        trainee_id, name, branch, cleaned_program, cleaned_class, level,
        speaking_project_to_next_level, life_project_to_next_level, last_speaking_project,
        level_up_sp, level_up_lp
      FROM report_activity
      WHERE life_project_to_next_level = '14%'
      LIMIT 3;
    `);

    console.log('Total Records:', total.rows[0].count);
    console.log('Records with Life Project:', countLp.rows[0].count);
    console.log('Records with Level Up SP:', countSp.rows[0].count);
    console.log('Columns:', cols.rows.map(r => r.column_name));
    console.log('Sample data (Life Project = 14%):', JSON.stringify(sample.rows, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

finalVerify();
