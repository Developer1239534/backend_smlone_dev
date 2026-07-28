const db = require('./src/db/neonClient');

async function main() {
  console.log('🗑️  Truncating login_trainee and portal_trainee...');

  await db.query('TRUNCATE TABLE login_trainee RESTART IDENTITY CASCADE');
  console.log('✅ login_trainee - cleared!');

  await db.query('TRUNCATE TABLE portal_trainee RESTART IDENTITY CASCADE');
  console.log('✅ portal_trainee - cleared!');

  const c1 = await db.query('SELECT COUNT(*) FROM login_trainee');
  const c2 = await db.query('SELECT COUNT(*) FROM portal_trainee');

  console.log('\n📊 Verification:');
  console.log(`  - login_trainee rows: ${c1.rows[0].count}`);
  console.log(`  - portal_trainee rows: ${c2.rows[0].count}`);

  process.exit(0);
}
main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
