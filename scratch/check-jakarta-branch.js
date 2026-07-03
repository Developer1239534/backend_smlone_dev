const db = require('../src/db/neonClient');

async function main() {
  try {
    // 1. Get list of distinct branches
    const branchesRes = await db.query("SELECT DISTINCT cabang FROM dashboard_trainne ORDER BY cabang");
    console.log('=== DISTINCT BRANCHES IN DATABASE ===');
    console.log(branchesRes.rows.map(r => r.cabang));

    // 2. Count trainees in Jakarta branches (case insensitive)
    const countRes = await db.query("SELECT cabang, COUNT(*) AS count FROM dashboard_trainne WHERE cabang ILIKE '%Jakarta%' GROUP BY cabang");
    console.log('\n=== JAKARTA BRANCHES COUNT ===');
    console.log(countRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
