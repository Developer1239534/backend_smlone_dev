const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query('SELECT COUNT(*) FROM level_1_cp_cleaned_trainee');
    console.log(`TOTAL DATA CP CLEANED TRAINEE: ${res.rows[0].count}`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

main();
