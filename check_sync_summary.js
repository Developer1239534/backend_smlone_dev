const db = require('./src/db/neonClient');

async function checkSyncSummary() {
  const total = await db.query(`SELECT COUNT(*) FROM portal_admin;`);
  const synced = await db.query(`SELECT COUNT(*) FROM portal_admin WHERE trainee_id IS NOT NULL AND trainee_id != '';`);
  const unmapped = await db.query(`SELECT name, class_name, branch FROM portal_admin WHERE trainee_id IS NULL OR trainee_id = '';`);

  console.log(`Total rows in portal_admin: ${total.rows[0].count}`);
  console.log(`Synced with trainee_id: ${synced.rows[0].count}`);
  console.log(`Unmapped rows: ${unmapped.rows.length}`);
  if (unmapped.rows.length > 0) {
    console.log('Unmapped sample:', unmapped.rows);
  }

  process.exit(0);
}

checkSyncSummary();
