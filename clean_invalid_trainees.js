const db = require('./src/db/neonClient');

async function clean() {
  console.log("Cleaning invalid records where trainee_id is not pure numeric...");

  const delPortal = await db.query(`
    DELETE FROM portal_trainee 
    WHERE trainee_id IS NULL OR trainee_id !~ '^[0-9]+$'
  `);
  console.log(`Deleted ${delPortal.rowCount} invalid records from portal_trainee.`);

  const delLogin = await db.query(`
    DELETE FROM login_trainee 
    WHERE student_id IS NULL OR student_id !~ '^[0-9]+$'
  `);
  console.log(`Deleted ${delLogin.rowCount} invalid records from login_trainee.`);

  const countPortal = await db.query(`SELECT COUNT(*) FROM portal_trainee`);
  const countLogin = await db.query(`SELECT COUNT(*) FROM login_trainee`);

  console.log(`Remaining valid records in portal_trainee: ${countPortal.rows[0].count}`);
  console.log(`Remaining valid records in login_trainee: ${countLogin.rows[0].count}`);
}

clean().catch(console.error);
