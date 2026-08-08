const db = require('./src/db/neonClient');

async function checkIdSources() {
  console.log('Searching for sample IDs in other database tables...');
  
  // Check portal_trainee
  const ptRes = await db.query(`SELECT trainee_id, name, branch_id FROM portal_trainee WHERE trainee_id IN ('70100104', '980', '1121', '90100181')`);
  console.log('Matches in portal_trainee:', ptRes.rows);

  // Check login_trainee
  const loginRes = await db.query(`SELECT student_id FROM login_trainee WHERE student_id IN ('70100104', '980', '1121', '90100181')`).catch(e => ({ rows: [] }));
  console.log('Matches in login_trainee:', loginRes.rows);

  // Check data_dashboard_keseluruhan
  const dashRes = await db.query(`SELECT * FROM data_dashboard_keseluruhan LIMIT 2`).catch(e => ({ rows: [] }));
  console.log('Sample data_dashboard_keseluruhan:', dashRes.rows);

  process.exit(0);
}

checkIdSources();
