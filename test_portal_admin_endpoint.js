const db = require('./src/db/neonClient');

async function test() {
  console.log('Testing portal_admin table query...');
  const res = await db.query('SELECT COUNT(*) FROM portal_admin');
  console.log('Total count:', res.rows[0].count);

  const sample = await db.query('SELECT id, name, class_name, branch, membership_status FROM portal_admin LIMIT 3');
  console.log('Sample rows:', sample.rows);
  process.exit(0);
}

test();
