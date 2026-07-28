const db = require('./src/db/neonClient');

async function main() {
  console.log('🗑️ Clearing table: dashboard_trainne...');

  await db.query('TRUNCATE dashboard_trainne RESTART IDENTITY CASCADE;');

  const res = await db.query('SELECT COUNT(*) FROM dashboard_trainne;');

  console.log(`✅ Table dashboard_trainne row count: ${res.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Error clearing table:', err);
  process.exit(1);
});
