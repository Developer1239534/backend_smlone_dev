const db = require('../src/db/neonClient');

async function checkGoldRank() {
  try {
    const result = await db.query('SELECT id, trainee_name, gold_rank FROM dashboard_trainne WHERE gold_rank IS NOT NULL;');
    console.log('Non-null gold_rank rows:', result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGoldRank();
