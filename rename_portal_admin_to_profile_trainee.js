require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    const res = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log('Existing tables:', res.rows.map(r => r.table_name));

    // Check if portal_admin exists
    const hasPortalAdmin = res.rows.some(r => r.table_name === 'portal_admin');
    const hasProfileTrainee = res.rows.some(r => r.table_name === 'profile_trainee');

    console.log(`portal_admin exists: ${hasPortalAdmin}, profile_trainee exists: ${hasProfileTrainee}`);

    if (hasPortalAdmin) {
      if (hasProfileTrainee) {
        console.log('Both tables exist. Dropping or renaming...');
        await db.query('DROP TABLE IF EXISTS profile_trainee CASCADE');
      }
      console.log('Renaming portal_admin to profile_trainee...');
      await db.query('ALTER TABLE portal_admin RENAME TO profile_trainee');
      console.log('✅ Table portal_admin successfully renamed to profile_trainee!');
    } else if (hasProfileTrainee) {
      console.log('✅ Table profile_trainee already exists!');
    }

    // Also create a VIEW named portal_admin so any legacy query still works seamlessly
    console.log('Creating VIEW portal_admin for backward compatibility...');
    await db.query('CREATE OR REPLACE VIEW portal_admin AS SELECT * FROM profile_trainee');
    console.log('✅ View portal_admin created!');

    const countRes = await db.query('SELECT COUNT(*) FROM profile_trainee');
    console.log(`📌 Records in profile_trainee: ${countRes.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
