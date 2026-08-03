const db = require('../src/db/neonClient');

async function run() {
  try {
    const activeRes = await db.query("SELECT COUNT(*) FROM login_portal_fix WHERE membership = 'Active'");
    const graceRes = await db.query("SELECT COUNT(*) FROM login_portal_fix WHERE membership = 'Active (Grace Period)'");
    const totalActiveRes = await db.query("SELECT COUNT(*) FROM login_portal_fix WHERE membership LIKE 'Active%'");
    const totalRes = await db.query("SELECT COUNT(*) FROM login_portal_fix");

    console.log('====================================');
    console.log('📊 LOGIN_PORTAL_FIX MEMBERSHIP STATS');
    console.log('====================================');
    console.log(`• Active: ${activeRes.rows[0].count} trainee`);
    console.log(`• Active (Grace Period): ${graceRes.rows[0].count} trainee`);
    console.log(`------------------------------------`);
    console.log(`• Total (Active + Grace): ${totalActiveRes.rows[0].count} trainee`);
    console.log(`• Total Seluruh Trainee: ${totalRes.rows[0].count} trainee`);
    console.log('====================================');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
