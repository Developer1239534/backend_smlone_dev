const db = require('./src/db/neonClient');

async function dropColumns() {
  console.log('Dropping columns program, cleaned_program, class, cleaned_class from link_report...');
  
  await db.query(`
    ALTER TABLE link_report
    DROP COLUMN IF EXISTS program,
    DROP COLUMN IF EXISTS cleaned_program,
    DROP COLUMN IF EXISTS class,
    DROP COLUMN IF EXISTS cleaned_class;
  `);

  console.log('✅ Columns dropped successfully!');

  const cols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='link_report';");
  console.log('Remaining columns in link_report:', cols.rows.map(x => x.column_name));
}

dropColumns().catch(console.error).then(() => process.exit(0));
