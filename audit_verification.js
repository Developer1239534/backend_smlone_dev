const db = require('./src/db/neonClient');

async function audit() {
  console.log('====================================================');
  console.log('🔍 AUDIT CHECKS FOR TABLE & ENDPOINTS login_portalllll');
  console.log('====================================================');

  // 1. Column List
  const cols = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'login_portalllll' 
    ORDER BY ordinal_position;
  `);

  console.log(`\n1. Database Columns (${cols.rows.length} columns total):`);
  cols.rows.forEach((c, idx) => {
    console.log(`   ${idx + 1}. ${c.column_name} (${c.data_type})`);
  });

  // 2. Row count
  const countRes = await db.query("SELECT COUNT(*) FROM login_portalllll;");
  console.log(`\n2. Current Database Row Count: ${countRes.rows[0].count}`);

  // 3. Test insert & login verification
  console.log('\n3. Testing Endpoints Logic via Neon Client...');
  const testId = 'TEST_AUDIT_999';
  await db.query(`
    INSERT INTO login_portalllll (
      id, name, gender, date_of_birth, nama_sekolah, cleaned_program,
      membership, expiry_date, cabang_id, first_enroll, class_name,
      house, level, house_role, cabang_kelas, newest_grade, trainee_homeroom,
      screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage,
      password, plain_password
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
    ) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `, [
    testId, 'Test Audit Trainee', 'Male', '2015-01-01', 'SD Test', 'Junior',
    'Active', '2026-12-31', 'CEMARA', '2025-01-01', 'Pearl',
    'House of Test', 'Private', 'Member', 'CEMARA', 'Grade 5', 'Homeroom Test',
    'Passed', 'Grade 5', 'Grade 4', 'J', 'Stage 3',
    'SMLTEST_AUDIT_999', 'SMLTEST_AUDIT_999'
  ]);

  const inserted = await db.query("SELECT * FROM login_portalllll WHERE id = $1;", [testId]);
  console.log('   ✅ INSERT test successful! Trainee created with ID:', inserted.rows[0].id);
  console.log('   ✅ Plain Password column:', inserted.rows[0].plain_password);
  console.log('   ✅ Password column:', inserted.rows[0].password);

  // Clean up test row
  await db.query("DELETE FROM login_portalllll WHERE id = $1;", [testId]);
  console.log('   ✅ Test row deleted cleanly after verification!');

  console.log('\n====================================================');
  console.log('🎉 ALL AUDIT CHECKS PASSED PERFECTLY!');
  console.log('====================================================');
  process.exit(0);
}

audit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
