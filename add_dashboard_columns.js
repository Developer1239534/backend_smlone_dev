const db = require('./src/db/neonClient');

async function migrate() {
  console.log('🔄 Checking and adding missing columns to dashboard_trainne...');

  const columnsToAdd = [
    { name: 'program', type: 'VARCHAR(255)' },
    { name: 'class', type: 'VARCHAR(255)' },
    { name: 'level', type: 'VARCHAR(255)' },
    { name: 'membership_expiry', type: 'VARCHAR(255)' },
    { name: 'last_speaking_project', type: 'VARCHAR(255)' },
    { name: 'weekly_report', type: 'TEXT' },
    { name: 'referral_code', type: 'VARCHAR(255)' },
    { name: 'gold_rank', type: 'VARCHAR(255)' },
    { name: 'progress_video', type: 'TEXT' },
    { name: 'phone', type: 'VARCHAR(255)' },
    { name: 'profile_picture', type: 'TEXT' },
    { name: 'tanggal_lahir', type: 'VARCHAR(255)' },
    { name: 'cabang', type: 'VARCHAR(255)' },
    { name: 'house_sml', type: 'VARCHAR(255)' },
    { name: 'total_gold_periode', type: 'INTEGER DEFAULT 0' },
    { name: 'junior_youth', type: 'VARCHAR(255)' },
    { name: 'rank_id_junior', type: 'VARCHAR(255)' },
    { name: 'rank_id_youth', type: 'VARCHAR(255)' },
    { name: 'rank_id_junior_timor', type: 'VARCHAR(255)' },
    { name: 'rank_id_youth_timor', type: 'VARCHAR(255)' },
    { name: 'rank_id_junior_tritura', type: 'VARCHAR(255)' },
    { name: 'rank_id_youth_tritura', type: 'VARCHAR(255)' },
    { name: 'rank_id_junior_cemara', type: 'VARCHAR(255)' },
    { name: 'rank_id_youth_cemara', type: 'VARCHAR(255)' },
    { name: 'gender', type: 'VARCHAR(50)' }
  ];

  for (const col of columnsToAdd) {
    try {
      await db.query(`ALTER TABLE dashboard_trainne ADD COLUMN ${col.name} ${col.type};`);
      console.log(`✅ Added column ${col.name}`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        // Ignore if already exists
      } else {
        console.error(`Error adding column ${col.name}:`, err.message);
      }
    }
  }

  // Populate dashboard_trainne from portal_trainee
  console.log('\n🔄 Syncing portal_trainee data to dashboard_trainne...');
  
  // Get all portal_trainee rows
  const ptRes = await db.query('SELECT * FROM portal_trainee WHERE name IS NOT NULL AND TRIM(name) != \'\';');
  console.log(`Found ${ptRes.rows.length} valid trainees in portal_trainee.`);

  let syncedCount = 0;
  for (const pt of ptRes.rows) {
    // Generate default plain password 'smlone{id}'
    const cleanId = String(pt.trainee_id).trim();
    const defaultPassword = `SML${cleanId}`;
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(defaultPassword, 10);

    const checkRes = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [cleanId]);
    if (checkRes.rows.length === 0) {
      await db.query(`
        INSERT INTO dashboard_trainne (
          id, trainee_name, status, password, plain_password, program, class, level,
          membership_expiry, last_speaking_project, weekly_report, referral_code,
          progress_video, phone, profile_picture, tanggal_lahir, cabang, house_sml,
          total_gold_periode, junior_youth, gender
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
      `, [
        cleanId, pt.name, 'Active', hash, defaultPassword, pt.program, pt.class, pt.level,
        pt.membership_expired_date ? pt.membership_expired_date.toISOString().split('T')[0] : null,
        pt.latest_speaking_project, pt.weekly_report_url, pt.referral_code,
        pt.progress_video_url, null, null, pt.date_of_birth ? pt.date_of_birth.toISOString().split('T')[0] : null,
        pt.branch_id, pt.house, pt.total_gold || 0, pt.kategori, pt.gender
      ]);
      syncedCount++;
    } else {
      // Update existing
      await db.query(`
        UPDATE dashboard_trainne SET
          trainee_name = $1,
          program = $2,
          class = $3,
          level = $4,
          membership_expiry = $5,
          last_speaking_project = $6,
          weekly_report = $7,
          referral_code = $8,
          progress_video = $9,
          tanggal_lahir = $10,
          cabang = $11,
          house_sml = $12,
          total_gold_periode = $13,
          junior_youth = $14,
          gender = $15,
          updated_at = NOW()
        WHERE id = $16
      `, [
        pt.name, pt.program, pt.class, pt.level,
        pt.membership_expired_date ? pt.membership_expired_date.toISOString().split('T')[0] : null,
        pt.latest_speaking_project, pt.weekly_report_url, pt.referral_code,
        pt.progress_video_url, pt.date_of_birth ? pt.date_of_birth.toISOString().split('T')[0] : null,
        pt.branch_id, pt.house, pt.total_gold || 0, pt.kategori, pt.gender,
        cleanId
      ]);
      syncedCount++;
    }
  }

  console.log(`✅ Synced ${syncedCount} trainees to dashboard_trainne table.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
