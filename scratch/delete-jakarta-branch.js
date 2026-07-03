const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query("UPDATE dashboard_trainne SET cabang = NULL WHERE cabang = 'Jakarta'");
    console.log('Update completed. Rows updated:', res.rowCount);

    // Verify distinct branches remaining
    const distinctRes = await db.query("SELECT DISTINCT cabang FROM dashboard_trainne ORDER BY cabang");
    console.log('Remaining distinct branches:', distinctRes.rows.map(r => r.cabang));
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
