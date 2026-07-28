const db = require('./src/db/neonClient');

async function main() {
  console.log('🔍 Checking for duplicate trainee_id in portal_trainee...\n');

  // Find duplicates
  const dupes = await db.query(`
    SELECT trainee_id, COUNT(*) as count
    FROM portal_trainee
    GROUP BY trainee_id
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `);

  if (dupes.rows.length === 0) {
    console.log('✅ No duplicates found in portal_trainee!');
  } else {
    console.log(`⚠️  Found ${dupes.rows.length} trainee_id(s) with duplicates:`);
    dupes.rows.forEach(r => console.log(`  - trainee_id: ${r.trainee_id} => ${r.count} rows`));
  }

  console.log('\n🔍 Checking for duplicate student_id in login_trainee...\n');

  const dupes2 = await db.query(`
    SELECT student_id, COUNT(*) as count
    FROM login_trainee
    GROUP BY student_id
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `);

  if (dupes2.rows.length === 0) {
    console.log('✅ No duplicates found in login_trainee!');
  } else {
    console.log(`⚠️  Found ${dupes2.rows.length} student_id(s) with duplicates:`);
    dupes2.rows.forEach(r => console.log(`  - student_id: ${r.student_id} => ${r.count} rows`));
  }

  const total1 = await db.query('SELECT COUNT(*) FROM portal_trainee');
  const total2 = await db.query('SELECT COUNT(*) FROM login_trainee');
  console.log(`\n📊 Total rows: portal_trainee=${total1.rows[0].count}, login_trainee=${total2.rows[0].count}`);

  process.exit(0);
}
main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
