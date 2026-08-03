require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🗑️ Dropping view/table `portal_admin` from database...');
    await db.query('DROP VIEW IF EXISTS portal_admin CASCADE');
    await db.query('DROP TABLE IF EXISTS portal_admin CASCADE');
    console.log('✅ `portal_admin` successfully deleted!');

    const res = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log('\n📋 Remaining tables in database:');
    console.log(res.rows.map(r => r.table_name));

  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
