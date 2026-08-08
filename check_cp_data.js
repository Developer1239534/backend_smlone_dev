const db = require('./src/db/neonClient');

async function checkCP() {
  console.log('=== CP / TIMOR ROWS ===');
  const res = await db.query(`
    SELECT id, name, class, cabang_id, membership 
    FROM data_dashboard_keseluruhan 
    WHERE UPPER(cabang_id) IN ('TIMOR', 'CP')
    LIMIT 10;
  `);
  console.log(res.rows);
  process.exit(0);
}

checkCP().catch(err => {
  console.error(err);
  process.exit(1);
});
