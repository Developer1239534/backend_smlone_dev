const db = require('./src/db/neonClient');

async function populateRawData() {
  console.log('Populating raw_data JSONB column for link_report...');
  const res1 = await db.query(`
    UPDATE link_report t
    SET raw_data = to_jsonb(t) - 'raw_data';
  `);
  console.log(`✅ link_report raw_data populated for ${res1.rowCount} rows.`);

  console.log('Populating raw_data JSONB column for report_activity...');
  const res2 = await db.query(`
    UPDATE report_activity t
    SET raw_data = to_jsonb(t) - 'raw_data';
  `);
  console.log(`✅ report_activity raw_data populated for ${res2.rowCount} rows.`);

  console.log('\n--- SAMPLE RAW DATA FROM link_report ---');
  const sample1 = await db.query('SELECT trainee_id, nama, raw_data FROM link_report LIMIT 2');
  console.log(JSON.stringify(sample1.rows, null, 2));

  console.log('\n--- SAMPLE RAW DATA FROM report_activity ---');
  const sample2 = await db.query('SELECT trainee_id, name, raw_data FROM report_activity LIMIT 2');
  console.log(JSON.stringify(sample2.rows, null, 2));
}

populateRawData().catch(console.error).then(() => process.exit(0));
