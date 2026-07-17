const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'level_1_ca_cleaned_trainee'
    `);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

main();
