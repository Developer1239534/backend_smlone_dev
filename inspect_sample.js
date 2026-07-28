const db = require('./src/db/neonClient');

async function inspectSample() {
  const res = await db.query(`SELECT * FROM portal_trainee WHERE trainee_id = '27'`);
  console.log("Sample ID 27 Data:", JSON.stringify(res.rows[0], null, 2));
}

inspectSample().catch(console.error);
