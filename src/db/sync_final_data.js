const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./neonClient');

async function ensureColumns() {
  const newCols = [
    'gender', 'school', 'first_enroll', 'house_role', 'class_branch',
    'newest_grade', 'screening_test', 'draft_grade', 'prev_grade',
    'ss_hub', 'last_life_project_date', 'last_life_project'
  ];
  
  for (const col of newCols) {
    try {
      await db.query(`ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS ${col} TEXT`);
      console.log(`Ensured column ${col}`);
    } catch (err) {
      console.error(`Error adding column ${col}:`, err);
    }
  }
}

function sanitizeClass(className) {
  if (!className) return null;
  return className.replace(/\s*\(Sat\s*4-6\)/gi, '').trim();
}

function sanitizeHouse(house) {
  if (!house) return null;
  house = house.trim();
  const validHouses = [
    'House of Havaria',
    'House of Quorion',
    'House of Thenova',
    'House of Creanova',
    'House of Reverion'
  ];
  return validHouses.includes(house) ? house : null;
}

async function main() {
  try {
    await ensureColumns();

    console.log('🔄 Backing up current dashboard_trainne table...');
    const backupResult = await db.query('SELECT * FROM dashboard_trainne');
    const backupPath = path.join(__dirname, '../../scratch/trainee_backup_final.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupResult.rows, null, 2), 'utf8');
    console.log(`✅ Backup successfully saved to: ${backupPath}`);

    const rawDataPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\faa8c175-a20d-47af-af0e-98a66846f5d4\\raw_data.txt';
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
        draft_grade: cols[18],
        prev_grade: cols[19],
        junior_youth: cols[20],
        ss_hub: cols[21],
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

    console.log(`📋 Parsed ${trainees.length} trainees from raw_data.txt.`);

    // Deleting old trainees not in new data
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
        passwordToUse = `smlone${t.id}`;
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
            tautan_tambahan, screening_test, draft_grade, prev_grade, junior_youth, ss_hub,
            weekly_report, last_speaking_project, progress_ke_next_level, last_life_project_date,
            last_life_project, referral_code, progress_video, gold_rank, password, plain_password
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
          )
        `, [
          t.id, t.name, t.gender, t.tanggal_lahir, t.school, t.program, t.status, t.membership_expiry,
          t.cabang, t.first_enroll, t.class, t.house_sml, t.level, t.house_role, t.class_branch, t.newest_grade,
          t.tautan_tambahan, t.screening_test, t.draft_grade, t.prev_grade, t.junior_youth, t.ss_hub,
          t.weekly_report, t.last_speaking_project, t.progress_ke_next_level, t.last_life_project_date,
          t.last_life_project, t.referral_code, t.progress_video, t.gold_rank, hashedPasswordToUse, passwordToUse
        ]);
        insertedCount++;
      } else {
        // Update
        await db.query(`
          UPDATE dashboard_trainne SET
            trainee_name = $2, gender = $3, tanggal_lahir = $4, school = $5, program = $6, status = $7, membership_expiry = $8,
            cabang = $9, first_enroll = $10, class = $11, house_sml = $12, level = $13, house_role = $14, class_branch = $15, newest_grade = $16,
            tautan_tambahan = $17, screening_test = $18, draft_grade = $19, prev_grade = $20, junior_youth = $21, ss_hub = $22,
            weekly_report = $23, last_speaking_project = $24, progress_ke_next_level = $25, last_life_project_date = $26,
            last_life_project = $27, referral_code = $28, progress_video = $29, gold_rank = $30
          WHERE id = $1
        `, [
          t.id, t.name, t.gender, t.tanggal_lahir, t.school, t.program, t.status, t.membership_expiry,
          t.cabang, t.first_enroll, t.class, t.house_sml, t.level, t.house_role, t.class_branch, t.newest_grade,
          t.tautan_tambahan, t.screening_test, t.draft_grade, t.prev_grade, t.junior_youth, t.ss_hub,
          t.weekly_report, t.last_speaking_project, t.progress_ke_next_level, t.last_life_project_date,
          t.last_life_project, t.referral_code, t.progress_video, t.gold_rank
        ]);
        updatedCount++;
      }
    }

    console.log(`Sync complete. Inserted: ${insertedCount}, Updated: ${updatedCount}`);
  } catch (e) {
    console.error(e);
  } finally {
    if(db.end) db.end();
  }
}

main();
