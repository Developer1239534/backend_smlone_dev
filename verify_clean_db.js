const db = require('./src/db/neonClient');

async function verify() {
  const invalidPortal = await db.query(`SELECT COUNT(*) FROM portal_trainee WHERE trainee_id !~ '^[0-9]+$'`);
  const invalidLogin = await db.query(`SELECT COUNT(*) FROM login_trainee WHERE student_id !~ '^[0-9]+$'`);

  const totalPortal = await db.query(`SELECT COUNT(*) FROM portal_trainee`);
  const totalLogin = await db.query(`SELECT COUNT(*) FROM login_trainee`);

  console.log("--- DATABASE VERIFICATION RESULT ---");
  console.log(`Total records in portal_trainee: ${totalPortal.rows[0].count}`);
  console.log(`Invalid non-numeric trainee_id in portal_trainee: ${invalidPortal.rows[0].count}`);
  console.log(`Total records in login_trainee: ${totalLogin.rows[0].count}`);
  console.log(`Invalid non-numeric student_id in login_trainee: ${invalidLogin.rows[0].count}`);
}

verify().catch(console.error);
