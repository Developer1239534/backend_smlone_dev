const db = require('../src/db/neonClient');

async function checkSpecificIds() {
  const targetIds = ['20', '21', '22', '27', '48', '100', '250', '500', '800', '1003', '1128'];
  
  console.log('🔍 Checking specific IDs in login_portal_fix table...\n');
  
  for (const id of targetIds) {
    const res = await db.query('SELECT * FROM login_portal_fix WHERE id = $1', [id]);
    if (res.rows.length > 0) {
      const r = res.rows[0];
      console.log(`✅ ID ${id}:`);
      console.log(`   - Name: ${r.name}`);
      console.log(`   - Password: ${r.password}`);
      console.log(`   - Program: ${r.cleaned_program}`);
      console.log(`   - Membership: ${r.membership}`);
      console.log(`   - Expiry Date: ${r.expiry_date ? r.expiry_date.toISOString().split('T')[0] : 'N/A'}`);
      console.log(`   - Class: ${r.class || '-'}`);
      console.log(`   - House: ${r.house || '-'}`);
      console.log(`   - Role: ${r.house_role || '-'}`);
    } else {
      console.log(`❌ ID ${id}: NOT FOUND`);
    }
  }

  const countRes = await db.query('SELECT COUNT(*) FROM login_portal_fix');
  console.log(`\n📊 Total count in login_portal_fix: ${countRes.rows[0].count} rows.`);
  process.exit(0);
}

checkSpecificIds().catch(err => {
  console.error(err);
  process.exit(1);
});
