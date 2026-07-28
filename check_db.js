const db = require('./src/db/neonClient');

async function check() {
  const res = await db.query(`SELECT trainee_id, name, date_of_birth, branch_id FROM portal_trainee ORDER BY trainee_id LIMIT 1000`);
  console.log(`Total records in portal_trainee: ${res.rows.length}`);
  
  const invalidIds = res.rows.filter(r => !r.trainee_id.match(/^\d+$/));
  console.log(`Invalid IDs count: ${invalidIds.length}`);
  if (invalidIds.length > 0) {
    console.log(`Sample invalid IDs:`, invalidIds.slice(0, 20));
  }

  // Also check if there are non-digit IDs or date strings in trainee_id column
  const dateLikeIds = res.rows.filter(r => r.trainee_id.includes('/') || r.trainee_id.includes('-') || isNaN(parseInt(r.trainee_id, 10)));
  console.log(`Date-like or non-numeric IDs:`, dateLikeIds);
}

check().catch(console.error);
