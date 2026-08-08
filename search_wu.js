const db = require('./src/db/neonClient');

async function searchWu() {
  const res = await db.query('SELECT trainee_id, name FROM portal_trainee WHERE name ILIKE \'%Wu%\' OR name ILIKE \'%Hans%\';');
  console.log('Trainees matching Wu or Hans:', res.rows);
  process.exit(0);
}

searchWu();
