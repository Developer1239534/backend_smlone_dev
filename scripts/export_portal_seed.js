const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('📦 Exporting all login_portal_fix rows to seed_login_portal_fix.json...');
  const res = await db.query(`
    SELECT id, name, password, gender, date_of_birth, nama_sekolah, cleaned_program, membership,
           expiry_date, cabang_id, first_enroll, class, house, level, house_role, cabang_kelas,
           newest_grade, trainee_homeroom, screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage
    FROM login_portal_fix ORDER BY id ASC
  `);
  
  console.log(`Fetched ${res.rows.length} rows.`);
  const jsonPath = path.join(__dirname, 'seed_login_portal_fix.json');
  fs.writeFileSync(jsonPath, JSON.stringify(res.rows, null, 2), 'utf8');
  console.log('Saved seed_login_portal_fix.json successfully! File size:', fs.statSync(jsonPath).size);

  process.exit(0);
}

main().catch(console.error);
