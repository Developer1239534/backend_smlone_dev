const db = require('./src/db/neonClient');

async function main() {
  console.log('🚀 Updating all portal_trainee branch_id from "cemara" to "tratura"...');

  const result = await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'tratura', updated_at = CURRENT_TIMESTAMP
  `);

  console.log(`✅ Rows updated: ${result.rowCount}`);

  // Verify
  const check = await db.query(
    "SELECT branch_id, COUNT(*) as total FROM portal_trainee GROUP BY branch_id"
  );
  console.log('\n📊 branch_id distribution after update:');
  check.rows.forEach(r => console.log(` - "${r.branch_id}": ${r.total} rows`));

  process.exit(0);
}
main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
