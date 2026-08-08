require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🗑️ Dropping table `login_trainee` from database...');
    await db.query('DROP TABLE IF EXISTS login_trainee CASCADE');
    console.log('✅ `login_trainee` table successfully deleted!');

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
