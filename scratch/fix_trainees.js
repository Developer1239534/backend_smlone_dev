const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log("Deleting duplicate trainees...");
    await pool.query("DELETE FROM dashboard_trainne WHERE id IN ('90100224', '968')");
    console.log("Deleted IDs 90100224 (Gyan dup) and 968 (Lady dup).");

    console.log("\nUpdating passwords to 'SML' + ID for all trainees...");
    
    // Find all trainees with wrong password format
    const res = await pool.query(`
      SELECT id, trainee_name, plain_password 
      FROM dashboard_trainne 
      WHERE plain_password != 'SML' || id 
        AND id NOT LIKE '%@%'
    `);
    
    console.log(`Found ${res.rowCount} trainees to update.`);
    
    for (const row of res.rows) {
      const newPlain = 'SML' + row.id;
      const newHash = bcrypt.hashSync(newPlain, 10);
      
      await pool.query(`
        UPDATE dashboard_trainne 
        SET plain_password = $1, password = $2 
        WHERE id = $3
      `, [newPlain, newHash, row.id]);
      
      console.log(`Updated ${row.trainee_name} (ID: ${row.id}) to password: ${newPlain}`);
    }
    
    console.log("\nAll trainees now use 'SML' + ID.");

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
