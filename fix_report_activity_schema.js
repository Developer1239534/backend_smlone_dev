const db = require('./src/db/neonClient');

async function fixReportActivitySchema() {
  console.log('Adding missing columns to report_activity table...');
  await db.query(`
    ALTER TABLE report_activity
    ADD COLUMN IF NOT EXISTS speaking_project_to_next_level VARCHAR(50),
    ADD COLUMN IF NOT EXISTS life_project_to_next_level VARCHAR(50),
    ADD COLUMN IF NOT EXISTS last_speaking_project VARCHAR(100),
    ADD COLUMN IF NOT EXISTS level_up_sp VARCHAR(100),
    ADD COLUMN IF NOT EXISTS level_up_lp VARCHAR(100),
    ADD COLUMN IF NOT EXISTS raw_data JSONB;
  `);
  console.log('✅ Columns verified on report_activity.');

  const cols = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'report_activity';
  `);
  console.log('Current report_activity columns:', cols.rows.map(c => c.column_name));
}

fixReportActivitySchema().catch(console.error).then(() => process.exit(0));
