const db = require('./src/db/neonClient');

async function checkCollins() {
  const res = await db.query(`
    SELECT * 
    FROM data_dashboard_keseluruhan 
    WHERE name = 'Collins Anderson';
  `);
  console.log('=== COLLINS ANDERSON COLUMN VALUES ===');
  console.log(res.rows[0]);
  process.exit(0);
}

checkCollins().catch(err => {
  console.error(err);
  process.exit(1);
});
