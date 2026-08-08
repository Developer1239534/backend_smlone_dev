const db = require('./src/db/neonClient');

async function lookupMissing() {
  try {
    const ids = ['90100196', '1153', '875'];
    for (const id of ids) {
      const pa = await db.query('SELECT trainee_id, name FROM portal_admin WHERE trainee_id = $1', [id]);
      if (pa.rows.length > 0) {
        console.log(`Found ${id} in portal_admin:`, pa.rows[0]);
        await db.query('UPDATE link_report SET nama = $1 WHERE trainee_id = $2', [pa.rows[0].name, id]);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

lookupMissing();
