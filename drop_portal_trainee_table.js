require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🗑️ Dropping table/view `portal_trainee`...');
    
    await db.query(`DROP TABLE IF EXISTS portal_trainee CASCADE;`);
    await db.query(`DROP VIEW IF EXISTS portal_trainee CASCADE;`);

    console.log('✅ Successfully dropped `portal_trainee` table/view!');

    const checkRes = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'portal_trainee';
    `);

    if (checkRes.rows.length === 0) {
      console.log('🔍 Verified: `portal_trainee` table NO LONGER EXISTS in database.');
    } else {
      console.log('⚠️ Warning: `portal_trainee` still exists.');
    }

  } catch (err) {
    console.error('Error dropping portal_trainee:', err);
  }
  process.exit(0);
})();
