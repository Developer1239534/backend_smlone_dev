const db = require('./src/db/neonClient');

async function main() {
  console.log('🗑️ Clearing tables: login_trainee & portal_trainee...');

  await db.query('TRUNCATE login_trainee, portal_trainee RESTART IDENTITY CASCADE;');

  const resLogin = await db.query('SELECT COUNT(*) FROM login_trainee;');
  const resPortal = await db.query('SELECT COUNT(*) FROM portal_trainee;');

  console.log(`✅ Table login_trainee row count: ${resLogin.rows[0].count}`);
  console.log(`✅ Table portal_trainee row count: ${resPortal.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Error clearing tables:', err);
  process.exit(1);
});
