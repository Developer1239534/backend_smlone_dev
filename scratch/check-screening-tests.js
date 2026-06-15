const db = require('../src/db/neonClient');

async function check() {
  try {
    const result = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE screening_test IS NOT NULL');
    console.log(`Found ${result.rows.length} rows where screening_test is not null.`);
    
    // Print first 50 rows to inspect
    console.log('\nSample rows:');
    console.log(JSON.stringify(result.rows.slice(0, 50), null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
