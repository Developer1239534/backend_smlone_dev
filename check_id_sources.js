const db = require('./src/db/neonClient');

async function checkIdSources() {
  console.log('Searching for sample IDs in other database tables...');
  const sampleIds = ['70100104', '980', '1121', '90100181'];

  // Check portal_trainee
  const ptRes = await db.query(`SELECT trainee_id, name, branch_id FROM portal_trainee WHERE trainee_id ANY($1)`, [sampleIds]).catch(e => ({ rows: [] }));
  console.log('Matches in portal_trainee:', ptRes.rows);

  // Check registrasi_cp
  const cpRes = await db.query(`SELECT id, full_name, contact_whatsapp FROM registrasi_cp LIMIT 3`).catch(e => ({ rows: [] }));
  console.log('Sample registrasi_cp:', cpRes.rows);

  // Check registrasi_tr
  const trRes = await db.query(`SELECT id, full_name FROM registrasi_tr LIMIT 3`).catch(e => ({ rows: [] }));
  console.log('Sample registrasi_tr:', trRes.rows);

  // Check registrasi_ca
  const caRes = await db.query(`SELECT id, full_name FROM registrasi_ca LIMIT 3`).catch(e => ({ rows: [] }));
  console.log('Sample registrasi_ca:', caRes.rows);

  process.exit(0);
}

checkIdSources();
