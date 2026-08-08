const db = require('../src/db/neonClient');

async function run() {
  try {
    const total = await db.query('SELECT COUNT(*) FROM login_portal_fix');
    const oratorCount = await db.query("SELECT COUNT(*) FROM login_portal_fix WHERE cleaned_program = 'Core/Orator Society'");
    const passwordsCount = await db.query("SELECT COUNT(*) FROM login_portal_fix WHERE password LIKE 'SML%'");
    const idRange = await db.query("SELECT MIN(CAST(id AS INTEGER)) as min_id, MAX(CAST(id AS INTEGER)) as max_id FROM login_portal_fix WHERE id ~ '^[0-9]+$'");
    const membershipDist = await db.query("SELECT membership, COUNT(*) FROM login_portal_fix GROUP BY membership");

    console.log('==============================================');
    console.log('✅ FINAL VERIFICATION SUMMARY - login_portal_fix');
    console.log('==============================================');
    console.log('Total Trainee Records:', total.rows[0].count);
    console.log('Core/Orator Society Program Count:', oratorCount.rows[0].count);
    console.log('Auto SML+ID Password Count:', passwordsCount.rows[0].count);
    console.log('Min ID & Max ID in Table:', idRange.rows[0]);
    console.log('Membership Distribution:');
    membershipDist.rows.forEach(r => {
      console.log(`  - ${r.membership || '(Empty)'}: ${r.count}`);
    });
    console.log('==============================================');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
