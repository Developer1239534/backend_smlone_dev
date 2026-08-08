const fs = require('fs');
const db = require('./src/db/neonClient');

async function syncData() {
  const fileContent = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\latest_user_request.txt', 'utf-8');
  
  const startPos = fileContent.indexOf('Last Real Stage\n');
  const dataText = startPos !== -1 ? fileContent.substring(startPos + 'Last Real Stage\n'.length) : fileContent;
  const lines = dataText.split('\n').map(l => l.strip ? l.strip() : l.trim()).filter(l => l.length > 0);

  const genders = new Set(['Male', 'Female']);
  const memberships = new Set(['Active', 'Active (Grace Period)', 'Expired']);
  const branches = new Set(['TIMOR', 'TRITURA', 'CEMARA']);
  const levels = new Set(['Private', 'Sergeant', 'Lt. Colonel', 'Colonel', 'General', 'Lt. General']);
  const houses = new Set(['House of Havaria', 'House of Thenova', 'House of Quorion', 'House of Reverion', 'House of Creanova']);
  const ajySet = new Set(['Junior', 'Youth', 'Apprentice']);

  const recordStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+$/.test(line)) {
      if (i + 1 < lines.length) {
        const nextL = lines[i + 1];
        if (!/^\d+$/.test(nextL) && !genders.has(nextL) && !memberships.has(nextL) && !nextL.startsWith('http')) {
          if (i + 2 < lines.length) {
            const nnL = lines[i + 2];
            if (genders.has(nnL) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(nnL) || nnL.includes('Program') || memberships.has(nnL) || branches.has(nnL)) {
              recordStarts.push(i);
            }
          }
        }
      }
    }
  }

  console.log(`Found ${recordStarts.length} records to parse.`);

  const records = [];
  for (let k = 0; k < recordStarts.length; k++) {
    const startIdx = recordStarts[k];
    const endIdx = (k + 1 < recordStarts.length) ? recordStarts[k + 1] : lines.length;
    const recLines = lines.slice(startIdx, endIdx);

    const rec = {
      id: recLines[0],
      name: recLines[1],
      gender: null,
      date_of_birth: null,
      nama_sekolah: null,
      cleaned_program: null,
      membership: null,
      expiry_date: null,
      cabang_id: null,
      first_enroll: null,
      class: null,
      house: null,
      level: null,
      house_role: null,
      cabang_kelas: null,
      newest_grade: null,
      trainee_homeroom: null,
      screening_test: null,
      draft_grade: null,
      prev_grade: null,
      ajy_by_class: null,
      last_real_stage: null
    };

    for (let idx = 2; idx < recLines.length; idx++) {
      const val = recLines[idx];
      if (genders.has(val) && !rec.gender) {
        rec.gender = val;
      } else if (memberships.has(val) && !rec.membership) {
        rec.membership = val;
      } else if (houses.has(val) && !rec.house) {
        rec.house = val;
      } else if (levels.has(val) && !rec.level) {
        rec.level = val;
      } else if (ajySet.has(val) && !rec.ajy_by_class) {
        rec.ajy_by_class = val;
      } else if (val.includes('Program') || val.includes('Professionals') || val.includes('Bangun')) {
        rec.cleaned_program = val;
      } else if (val.startsWith('[http') || val.startsWith('http')) {
        rec.screening_test = val.replace(/^\[/, '').replace(/\]\(.*\)$/, '').replace(/\]$/, '');
      } else if (branches.has(val)) {
        if (!rec.cabang_id) rec.cabang_id = val;
        else if (!rec.cabang_kelas) rec.cabang_kelas = val;
      } else if (/\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4}/i.test(val) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(val)) {
        if (!rec.date_of_birth && !rec.membership) rec.date_of_birth = val;
        else if (rec.membership && !rec.expiry_date && !rec.first_enroll) rec.expiry_date = val;
        else if (rec.cabang_id && !rec.first_enroll) rec.first_enroll = val;
        else if (!rec.last_real_stage) rec.last_real_stage = val;
      } else if (!rec.class && (val === 'Obsidian' || val.toLowerCase().includes('waiting list') || val.includes('(') || ['Gates', 'Dale', 'Clinton', 'Einstein', 'Millman', 'Kiyosaki', 'Winfrey', 'Doyle', 'Spielberg', 'Ziglar', 'Batari', 'Apprentice', 'Neverland', 'Hogwarts', 'Narnia', 'Wonderland', 'Graham', 'Mandela', 'Ruby', 'Pearl', 'Amber', 'Alexandrite', 'Beryl', 'Sapphire', 'Jade', 'Topaz', 'Galileo', 'Gandhi', 'Lincoln', 'Grande', 'Denver', 'Atlanta', 'Auckland', 'Cairo', 'Eldorado', 'Asheville', 'Whomville', 'Canfield', 'Confidence'].some(c => val.includes(c)))) {
        rec.class = val.replace(/\s*\(.*?\)/g, '').trim();
      } else if (['Loita', 'Ghaitsa', 'Muly', 'Rizky', 'Agustina', 'Nabilah'].includes(val)) {
        rec.trainee_homeroom = val;
      } else if (/^\d{1,2}$/.test(val)) {
        if (!rec.newest_grade) rec.newest_grade = val;
        else if (!rec.draft_grade) rec.draft_grade = val;
        else if (!rec.prev_grade) rec.prev_grade = val;
      } else if (!rec.nama_sekolah && rec.gender && (!rec.membership || !rec.cleaned_program)) {
        rec.nama_sekolah = val;
      }
    }

    // Ensure class name is clean (strip schedule parentheses if any remain)
    if (rec.class) {
      rec.class = rec.class.replace(/\s*\(.*?\)/g, '').trim();
    }

    records.push(rec);
  }

  console.log(`Parsed ${records.length} records. Starting database sync...`);

  let updatedDashboardCount = 0;
  let insertedDashboardCount = 0;
  let updatedPortalCount = 0;
  let updatedTraineeCount = 0;

  for (const r of records) {
    // 1. Sync data_dashboard_keseluruhan
    const existingDash = await db.query('SELECT id FROM data_dashboard_keseluruhan WHERE id = $1', [r.id]);
    if (existingDash.rows.length > 0) {
      await db.query(`
        UPDATE data_dashboard_keseluruhan SET
          name = COALESCE($2, name),
          gender = COALESCE($3, gender),
          date_of_birth = COALESCE($4, date_of_birth),
          nama_sekolah = COALESCE($5, nama_sekolah),
          cleaned_program = COALESCE($6, cleaned_program),
          membership = COALESCE($7, membership),
          expiry_date = COALESCE($8, expiry_date),
          cabang_id = COALESCE($9, cabang_id),
          first_enroll = COALESCE($10, first_enroll),
          class = COALESCE($11, class),
          house = COALESCE($12, house),
          level = COALESCE($13, level),
          house_role = COALESCE($14, house_role),
          cabang_kelas = COALESCE($15, cabang_kelas),
          newest_grade = COALESCE($16, newest_grade),
          trainee_homeroom = COALESCE($17, trainee_homeroom),
          screening_test = COALESCE($18, screening_test),
          draft_grade = COALESCE($19, draft_grade),
          prev_grade = COALESCE($20, prev_grade),
          ajy_by_class = COALESCE($21, ajy_by_class),
          last_real_stage = COALESCE($22, last_real_stage)
        WHERE id = $1
      `, [
        r.id, r.name, r.gender, r.date_of_birth, r.nama_sekolah,
        r.cleaned_program, r.membership, r.expiry_date, r.cabang_id,
        r.first_enroll, r.class, r.house, r.level, r.house_role,
        r.cabang_kelas, r.newest_grade, r.trainee_homeroom, r.screening_test,
        r.draft_grade, r.prev_grade, r.ajy_by_class, r.last_real_stage
      ]);
      updatedDashboardCount++;
    } else {
      await db.query(`
        INSERT INTO data_dashboard_keseluruhan (
          id, name, gender, date_of_birth, nama_sekolah, cleaned_program,
          membership, expiry_date, cabang_id, first_enroll, class, house,
          level, house_role, cabang_kelas, newest_grade, trainee_homeroom,
          screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        )
      `, [
        r.id, r.name, r.gender, r.date_of_birth, r.nama_sekolah,
        r.cleaned_program, r.membership, r.expiry_date, r.cabang_id,
        r.first_enroll, r.class, r.house, r.level, r.house_role,
        r.cabang_kelas, r.newest_grade, r.trainee_homeroom, r.screening_test,
        r.draft_grade, r.prev_grade, r.ajy_by_class, r.last_real_stage
      ]);
      insertedDashboardCount++;
    }

    // 2. Sync portal_trainee
    const portalRes = await db.query(`
      UPDATE portal_trainee SET
        name = COALESCE($2, name),
        gender = COALESCE($3, gender),
        school_name = COALESCE($4, school_name),
        program = COALESCE($5, program),
        class = COALESCE($6, class),
        house = COALESCE($7, house),
        level = COALESCE($8, level),
        branch_id = COALESCE($9, branch_id),
        newest_grade = COALESCE($10, newest_grade),
        trainee_homeroom = COALESCE($11, trainee_homeroom),
        screening_test_url = COALESCE($12, screening_test_url),
        kategori = COALESCE($13, kategori),
        updated_at = NOW()
      WHERE trainee_id = $1
    `, [
      r.id, r.name, r.gender, r.nama_sekolah, r.cleaned_program,
      r.class, r.house, r.level, r.cabang_id, r.newest_grade,
      r.trainee_homeroom, r.screening_test, r.ajy_by_class
    ]);
    if (portalRes.rowCount > 0) updatedPortalCount++;

    // 3. Sync dashboard_trainne
    const dashRes = await db.query(`
      UPDATE dashboard_trainne SET
        trainee_name = COALESCE($2, trainee_name),
        gender = COALESCE($3, gender),
        status = COALESCE($4, status),
        program = COALESCE($5, program),
        class = COALESCE($6, class),
        level = COALESCE($7, level),
        membership_expiry = COALESCE($8, membership_expiry),
        cabang = COALESCE($9, cabang),
        house_sml = COALESCE($10, house_sml),
        junior_youth = COALESCE($11, junior_youth)
      WHERE id = $1
    `, [
      r.id, r.name, r.gender, r.membership, r.cleaned_program,
      r.class, r.level, r.expiry_date, r.cabang_id, r.house, r.ajy_by_class
    ]);
    if (dashRes.rowCount > 0) updatedTraineeCount++;
  }

  console.log(`✅ Sync Completed successfully!`);
  console.log(`- data_dashboard_keseluruhan: ${updatedDashboardCount} updated, ${insertedDashboardCount} inserted.`);
  console.log(`- portal_trainee: ${updatedPortalCount} updated.`);
  console.log(`- dashboard_trainne: ${updatedTraineeCount} updated.`);

  process.exit(0);
}

syncData().catch(err => {
  console.error('Error during data sync:', err);
  process.exit(1);
});
