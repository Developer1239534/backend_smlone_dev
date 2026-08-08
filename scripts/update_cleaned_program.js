const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🔄 Updating cleaned_program in login_portal_fix to Core/Orator Society Program...');

  // 1. Update database table
  const res = await db.query(`
    UPDATE login_portal_fix
    SET cleaned_program = 'Core/Orator Society Program', updated_at = NOW();
  `);
  console.log(`✅ Updated ${res.rowCount} rows in login_portal_fix in Neon PostgreSQL!`);

  // 2. Re-export seed_login_portal_fix.json
  const exportRes = await db.query(`
    SELECT id, name, password, gender, date_of_birth, nama_sekolah, cleaned_program, membership,
           expiry_date, cabang_id, first_enroll, class, house, level, house_role, cabang_kelas,
           newest_grade, trainee_homeroom, screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage
    FROM login_portal_fix ORDER BY id ASC
  `);

  const jsonPath = path.join(__dirname, 'seed_login_portal_fix.json');
  fs.writeFileSync(jsonPath, JSON.stringify(exportRes.rows, null, 2), 'utf8');
  console.log(`📦 Saved seed_login_portal_fix.json successfully! (${exportRes.rows.length} rows)`);

  process.exit(0);
}

main().catch(console.error);
