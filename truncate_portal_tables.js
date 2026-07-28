const db = require('./src/db/neonClient');

async function main() {
  console.log('🧹 Truncating login_trainee and portal_trainee tables...');

  // Delete from login_trainee first, then portal_trainee
  await db.query('TRUNCATE TABLE login_trainee, portal_trainee CASCADE;');

  const loginRes = await db.query('SELECT COUNT(*) FROM login_trainee;');
  const portalRes = await db.query('SELECT COUNT(*) FROM portal_trainee;');

  console.log('--- Truncate Verification ---');
  console.log(`login_trainee count: ${loginRes.rows[0].count}`);
  console.log(`portal_trainee count: ${portalRes.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Truncate error:', err);
  process.exit(1);
});
