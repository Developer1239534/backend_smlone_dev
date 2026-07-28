const db = require('./src/db/neonClient');

async function test() {
  const res = await db.query(`
    SELECT trainee_id, name, level, house, class, branch_id, total_gold, kategori 
    FROM portal_trainee 
    WHERE UPPER(branch_id) = 'CEMARA' AND total_gold > 0 
    ORDER BY total_gold DESC 
    LIMIT 5
  `);
  console.log('Top 5 CEMARA trainees:', res.rows);
  process.exit(0);
}

test();
