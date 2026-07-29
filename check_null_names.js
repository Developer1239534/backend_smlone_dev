const db = require('./src/db/neonClient');

async function checkNullNames() {
  const nullNamesRes = await db.query('SELECT trainee_id, name, total_gold, kategori FROM portal_trainee WHERE name IS NULL OR TRIM(name) = \'\' OR LOWER(name) = \'trainee\' OR LOWER(name) = \'youth\'');
  console.log(`Found ${nullNamesRes.rows.length} rows with NULL or invalid names:`);
  console.log(nullNamesRes.rows.slice(0, 20));

  const countRes = await db.query('SELECT COUNT(*) FROM portal_trainee');
  console.log(`Total trainees in portal_trainee: ${countRes.rows[0].count}`);
  process.exit(0);
}

checkNullNames();
