const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query("SELECT * FROM real_stage WHERE url LIKE '%STIg%'");
    console.log('Results:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
