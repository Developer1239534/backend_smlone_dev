const db = require('./src/db/neonClient');

async function check() {
  const finalBranch = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id ORDER BY COUNT(*) DESC;');
  console.log('--- FINAL Branch Distribution ---');
  console.table(finalBranch.rows);
}

check();
