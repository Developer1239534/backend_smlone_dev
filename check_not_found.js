const db = require('./src/db/neonClient');

async function checkNotFound() {
  // Check if ID 30 exists in portal_trainee
  const res1 = await db.query('SELECT * FROM portal_trainee WHERE trainee_id = \'30\';');
  console.log('Trainee with ID 30:', res1.rows);

  // Check if name containing 'Chris' exists
  const res2 = await db.query('SELECT * FROM portal_trainee WHERE name ILIKE \'%Chris%\' LIMIT 5;');
  console.log('Trainees matching Chris:', res2.rows);

  // Check if any trainee_id matches '30' or '030' or '30' inside a longer string
  const res3 = await db.query('SELECT * FROM portal_trainee WHERE trainee_id ILIKE \'%30%\' LIMIT 5;');
  console.log('Trainee IDs containing 30:', res3.rows);

  process.exit(0);
}

checkNotFound();
