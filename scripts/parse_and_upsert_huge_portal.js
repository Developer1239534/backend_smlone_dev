const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🚀 Seeding login_portal_fix from seed_login_portal_fix.json...');

  // 1. Ensure column lengths
  await db.query(`
    ALTER TABLE login_portal_fix ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN gender TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN password TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN wa_trainee TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN email TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN wa_orang_tua TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN kategori TYPE VARCHAR(255);
  `);

  // Helper retry query
  async function queryWithRetry(sql, params, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await db.query(sql, params);
      } catch (err) {
        console.warn(`[Attempt ${attempt}/${retries}] Query failed: ${err.message}. Retrying in 2s...`);
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  // Load JSON data
  const jsonPath = path.join(__dirname, 'seed_login_portal_fix.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ seed_login_portal_fix.json file not found!');
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${records.length} records from seed_login_portal_fix.json.`);

  // Batch upsert
  const BATCH_SIZE = 25;
  let inserted = 0;

  for (let b = 0; b < records.length; b += BATCH_SIZE) {
    const chunk = records.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];

    chunk.forEach((t, idx) => {
      const base = idx * 23;
      const password = t.password || `SML${String(t.id).toUpperCase()}`;
      valuePlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17}, $${base + 18}, $${base + 19}, $${base + 20}, $${base + 21}, $${base + 22}, $${base + 23}, NOW())`);
      params.push(
        t.id, t.name, password, t.gender, t.date_of_birth || null, t.nama_sekolah, t.cleaned_program, t.membership,
        t.expiry_date || null, t.cabang_id, t.first_enroll || null, t.class, t.house, t.level, t.house_role, t.cabang_kelas,
        t.newest_grade, t.trainee_homeroom, t.screening_test, t.draft_grade, t.prev_grade, t.ajy_by_class, t.last_real_stage || null
      );
    });

    const query = `
      INSERT INTO login_portal_fix (
        id, name, password, gender, date_of_birth, nama_sekolah, cleaned_program, membership,
        expiry_date, cabang_id, first_enroll, class, house, level, house_role, cabang_kelas,
        newest_grade, trainee_homeroom, screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage, updated_at
      )
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        gender = EXCLUDED.gender,
        date_of_birth = EXCLUDED.date_of_birth,
        nama_sekolah = EXCLUDED.nama_sekolah,
        cleaned_program = EXCLUDED.cleaned_program,
        membership = EXCLUDED.membership,
        expiry_date = EXCLUDED.expiry_date,
        cabang_id = EXCLUDED.cabang_id,
        first_enroll = EXCLUDED.first_enroll,
        class = EXCLUDED.class,
        house = EXCLUDED.house,
        level = EXCLUDED.level,
        house_role = EXCLUDED.house_role,
        cabang_kelas = EXCLUDED.cabang_kelas,
        newest_grade = EXCLUDED.newest_grade,
        trainee_homeroom = EXCLUDED.trainee_homeroom,
        screening_test = EXCLUDED.screening_test,
        draft_grade = EXCLUDED.draft_grade,
        prev_grade = EXCLUDED.prev_grade,
        ajy_by_class = EXCLUDED.ajy_by_class,
        last_real_stage = EXCLUDED.last_real_stage,
        updated_at = NOW();
    `;

    await queryWithRetry(query, params);
    inserted += chunk.length;
    console.log(`Upserted batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)} (${inserted}/${records.length})`);
  }

  // Sync names with report_trainee
  console.log('🔄 Syncing report_trainee names...');
  await queryWithRetry(`
    UPDATE report_trainee r
    SET name = l.name, updated_at = NOW()
    FROM login_portal_fix l
    WHERE LOWER(r.id::text) = LOWER(l.id::text) OR LOWER(r.trainee_id::text) = LOWER(l.id::text);
  `);
  console.log('✅ Synchronized report_trainee names!');

  process.exit(0);
}

main().catch(console.error);
