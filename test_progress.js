const db = require('./src/db/neonClient');

async function test() {
  const res = await db.query('SELECT speaking_project_to_next_level FROM portal_trainee WHERE trainee_id = \'625\'');
  console.log('Trainee 625 speaking_project_to_next_level:', res.rows[0]);
  process.exit(0);
}

test();
