const db = require('./src/db/neonClient');

async function check() {
  const res = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id ORDER BY COUNT(*) DESC;');
  console.log('--- DB Branch Distribution ---');
  console.table(res.rows);
}

check();
