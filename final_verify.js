const db = require('./src/db/neonClient');

async function finalVerify() {
  try {
    const total = await db.query('SELECT COUNT(*) FROM link_report');
    const withName = await db.query("SELECT COUNT(*) FROM link_report WHERE nama IS NOT NULL AND nama != ''");
    const withStatus = await db.query("SELECT COUNT(*) FROM link_report WHERE status IS NOT NULL AND status != ''");
    const withDrive = await db.query("SELECT COUNT(*) FROM link_report WHERE link_term IS NOT NULL");
    const withYt = await db.query("SELECT COUNT(*) FROM link_report WHERE link_youtube IS NOT NULL");

    console.log('\nFINAL DATABASE STATS:');
    console.log(`Total Rows: ${total.rows[0].count}`);
    console.log(`Rows with Name: ${withName.rows[0].count}`);
    console.log(`Rows with Status: ${withStatus.rows[0].count}`);
    console.log(`Rows with Google Drive Link: ${withDrive.rows[0].count}`);
    console.log(`Rows with YouTube Link: ${withYt.rows[0].count}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

finalVerify();
