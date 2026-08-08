const db = require('./src/db/neonClient');

async function testQuery() {
  const res = await db.query('SELECT * FROM dashboard_trainne LIMIT 5;');
  console.log('dashboard_trainne sample:', res.rows);
  const countRes = await db.query('SELECT COUNT(*) FROM dashboard_trainne');
  console.log('dashboard_trainne count:', countRes.rows[0].count);
  process.exit(0);
}

testQuery();
