const db = require('./src/db/neonClient');

async function main() {
  // Check columns
  const cols = await db.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'portal_trainee'"
  );
  console.log('Columns in portal_trainee:');
  cols.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));

  // Sample row
  const sample = await db.query('SELECT * FROM portal_trainee LIMIT 2');
  console.log('\nSample rows:');
  sample.rows.forEach(r => console.log(JSON.stringify(r)));

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
