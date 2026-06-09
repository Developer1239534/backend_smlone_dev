const db = require('../src/db/neonClient');

async function testQuery() {
  try {
    const result = await db.query('SELECT * FROM dashboard_trainne LIMIT 5;');
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testQuery();
