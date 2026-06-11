const db = require('../src/db/neonClient');

async function testQuery() {
  try {
    const result = await db.query('SELECT id, trainee_name, total_gold_periode FROM dashboard_trainne LIMIT 30;');
    console.log(result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testQuery();

