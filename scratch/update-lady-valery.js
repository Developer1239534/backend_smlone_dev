const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query("UPDATE dashboard_trainne SET speaking_project_to_next_level = '30%' WHERE id = '966'");
    console.log('Update result:', res.rowCount, 'rows updated.');
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
