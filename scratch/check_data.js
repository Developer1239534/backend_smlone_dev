const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query('SELECT id, name, grade, level, raw_data FROM level_1_ca_cleaned_trainee ORDER BY id DESC LIMIT 2');
    console.log("Menampilkan 2 data terbaru:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

main();
