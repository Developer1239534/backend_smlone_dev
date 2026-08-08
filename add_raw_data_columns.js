const db = require('./src/db/neonClient');

async function addRawDataColumns() {
  console.log('Adding raw_data JSONB column to tables...');

  const tables = ['link_report', 'report_activity', 'portal_trainee', 'portal_admin'];

  for (const t of tables) {
    try {
      await db.query(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS raw_data JSONB;`);
      console.log(`✅ Column raw_data (JSONB) added/verified for table [${t}]`);
    } catch (err) {
      console.error(`❌ Error updating table [${t}]:`, err.message);
    }
  }

  console.log('\n--- VERIFICATION OF COLUMNS ---');
  for (const t of tables) {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${t}' AND column_name = 'raw_data';
    `);
    console.log(`Table [${t}]:`, res.rows);
  }
}

addRawDataColumns().catch(console.error).then(() => process.exit(0));
