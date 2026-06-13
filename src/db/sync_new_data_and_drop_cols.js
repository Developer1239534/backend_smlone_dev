const db = require('./neonClient');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const allowedColumns = [
  'id', 'trainee_name', 'gender', 'tanggal_lahir', 'school', 'program', 'status',
  'membership_expiry', 'cabang', 'first_enroll', 'class', 'house_sml', 'level',
  'house_role', 'class_branch', 'newest_grade', 'tautan_tambahan', 'screening_test',
  'junior_youth', 'weekly_report',
  'last_speaking_project', 'progress_ke_next_level', 'last_life_project_date',
  'last_life_project', 'referral_code', 'progress_video', 'gold_rank',
  'password', 'plain_password', 'profile_picture', 'phone'
];

function sanitizeClass(cls) {
  if (!cls) return null;
  return cls.replace(/\s*\(Sat\s*4-6\)/gi, '').trim();
}

function sanitizeHouse(house) {
  if (!house) return null;
  return house.trim();
}

async function dropExtraColumns() {
  const result = await db.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'dashboard_trainne'
  `);
  const currentColumns = result.rows.map(r => r.column_name);
  
  for (const col of currentColumns) {
    if (!allowedColumns.includes(col)) {
      console.log(`Dropping column: ${col}`);
      await db.query(`ALTER TABLE dashboard_trainne DROP COLUMN "${col}"`);
    }
  }
}

async function syncData() {
  try {
    await dropExtraColumns();
    console.log('✅ Dropped extra columns (ss_hub, draft_grade, prev_grade)');

    const rawDataPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\faa8c175-a20d-47af-af0e-98a66846f5d4\\raw_data_newest.txt';
    const content = fs.readFileSync(rawDataPath, 'utf-8');
    const lines = content.split(/\r?\n/);

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('ID\tName') || lines[i].includes('semua nya yaaID\tName')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      throw new Error('Could not find header line');
    }

    const trainees = [];
    const idsSet = new Set();

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = lines[i].split('\t').map(c => c.trim());
      if (cols.length < 2 || !cols[0] || isNaN(cols[0])) continue;

      const id = cols[0];
      trainees.push({
        id: id,
        name: cols[1],
        gender: cols[2],
        tanggal_lahir: cols[3],
        school: cols[4],
        program: cols[5],
        status: cols[6],
        membership_expiry: cols[7],
        cabang: cols[8],
        first_enroll: cols[9],
        class: sanitizeClass(cols[10]),
        house_sml: sanitizeHouse(cols[11]),
        level: cols[12],
        house_role: cols[13],
        class_branch: cols[14],
        newest_grade: cols[15],
        tautan_tambahan: cols[16],
        screening_test: cols[17],
        // cols[18] is draft_grade
        // cols[19] is prev_grade
        junior_youth: cols[20],
        // cols[21] is ss_hub
        weekly_report: cols[22],
        last_speaking_project: cols[23],
        progress_ke_next_level: cols[24],
        last_life_project_date: cols[25],
        last_life_project: cols[26],
        referral_code: cols[27],
        progress_video: cols[28],
        gold_rank: cols[29]
      });
      idsSet.add(id);
    }

    console.log(`📋 Parsed ${trainees.length} trainees from newest data.`);

    // Delete trainees not in new data
    console.log('🗑️ Deleting trainees not in the parsed list...');
    const validIds = Array.from(idsSet);
    const deleteResult = await db.query(
      'DELETE FROM dashboard_trainne WHERE id NOT IN (SELECT unnest($1::varchar[]))',
      [validIds]
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} trainees not in the list.`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const t of trainees) {
      const checkResult = await db.query('SELECT id, password, plain_password FROM dashboard_trainne WHERE id = $1', [t.id]);
      
      let passwordToUse = null;
      let hashedPasswordToUse = null;

      if (checkResult.rows.length === 0 || !checkResult.rows[0].password) {
        passwordToUse = `SML${t.id}`;
        hashedPasswordToUse = await bcrypt.hash(passwordToUse, 10);
      } else {
        passwordToUse = checkResult.rows[0].plain_password;
        hashedPasswordToUse = checkResult.rows[0].password;
      }

      if (checkResult.rows.length === 0) {
        // Insert
        await db.query(`
          INSERT INTO dashboard_trainne (
            id, trainee_name, gender, tanggal_lahir, school, program, status, membership_expiry,
            cabang, first_enroll, class, house_sml, level, house_role, class_branch, newest_grade,
            tautan_tambahan, screening_test, junior_youth,
            weekly_report, last_speaking_project, progress_ke_next_level, last_life_project_date,
            last_life_project, referral_code, progress_video, gold_rank, password, plain_password
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
          )
        `, [
          t.id, t.name, t.gender, t.tanggal_lahir, t.school, t.program, t.status, t.membership_expiry,
          t.cabang, t.first_enroll, t.class, t.house_sml, t.level, t.house_role, t.class_branch, t.newest_grade,
          t.tautan_tambahan, t.screening_test, t.junior_youth,
          t.weekly_report, t.last_speaking_project, t.progress_ke_next_level, t.last_life_project_date,
          t.last_life_project, t.referral_code, t.progress_video, t.gold_rank, hashedPasswordToUse, passwordToUse
        ]);
        insertedCount++;
      } else {
        // Update
        await db.query(`
          UPDATE dashboard_trainne SET
            trainee_name=$1, gender=$2, tanggal_lahir=$3, school=$4, program=$5, status=$6, membership_expiry=$7,
            cabang=$8, first_enroll=$9, class=$10, house_sml=$11, level=$12, house_role=$13, class_branch=$14, newest_grade=$15,
            tautan_tambahan=$16, screening_test=$17, junior_youth=$18,
            weekly_report=$19, last_speaking_project=$20, progress_ke_next_level=$21, last_life_project_date=$22,
            last_life_project=$23, referral_code=$24, progress_video=$25, gold_rank=$26
          WHERE id = $27
        `, [
          t.name, t.gender, t.tanggal_lahir, t.school, t.program, t.status, t.membership_expiry,
          t.cabang, t.first_enroll, t.class, t.house_sml, t.level, t.house_role, t.class_branch, t.newest_grade,
          t.tautan_tambahan, t.screening_test, t.junior_youth,
          t.weekly_report, t.last_speaking_project, t.progress_ke_next_level, t.last_life_project_date,
          t.last_life_project, t.referral_code, t.progress_video, t.gold_rank, t.id
        ]);
        updatedCount++;
      }
    }

    console.log(`✅ Synced! Inserted: ${insertedCount}, Updated: ${updatedCount}`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error syncing data:', err);
    process.exit(1);
  }
}

syncData();
