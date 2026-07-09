const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log("Checking for duplicate IDs...");
    const idRes = await pool.query(`
      SELECT id, COUNT(*) as count 
      FROM dashboard_trainne 
      GROUP BY id 
      HAVING COUNT(*) > 1
    `);
    console.log(`Found ${idRes.rowCount} duplicate IDs:`);
    console.log(idRes.rows);

    console.log("\nChecking for duplicate trainee_names...");
    const nameRes = await pool.query(`
      SELECT trainee_name, COUNT(*) as count 
      FROM dashboard_trainne 
      GROUP BY trainee_name 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    console.log(`Found ${nameRes.rowCount} duplicate trainee_names:`);
    console.log(nameRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
