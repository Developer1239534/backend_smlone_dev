const db = require('./src/db/neonClient');

async function checkMissing() {
  try {
    const res = await db.query("SELECT trainee_id, term, link_term, link_youtube FROM link_report WHERE nama IS NULL OR nama = ''");
    console.log('Missing name rows:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkMissing();
