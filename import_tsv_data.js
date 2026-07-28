const fs = require('fs');
const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

// Save raw TSV input to raw_tsv_input.txt
const rawText = fs.readFileSync(__dirname + '/raw_tsv_input.txt', 'utf8');

function parseDateStr(str) {
  if (!str) return null;
  const cleaned = str.trim();
  if (!cleaned || cleaned === '-' || cleaned.toLowerCase() === 'null') return null;

  // Handles 'M/D/YYYY' or 'MM/DD/YYYY' like '11/23/2024' or '4/18/2016'
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      let [m, d, y] = parts;
      m = m.padStart(2, '0');
      d = d.padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // Handles '11 Jan 12', '22 May 2027', '02 Dec 2021', '1 Sep 2026', '27 Oct 16'
  const parts = cleaned.split(/\s+/);
  if (parts.length === 3) {
    let [day, monthStr, yearStr] = parts;
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const m = months[monthStr.toLowerCase().substring(0, 3)];
    if (m) {
      if (yearStr.length === 2) {
        const yr = parseInt(yearStr, 10);
        yearStr = (yr > 50 ? '19' : '20') + (yr < 10 ? '0' + yr : yr);
      }
      day = day.padStart(2, '0');
      return `${yearStr}-${m}-${day}`;
    }
  }

  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function getBranch(id, cabangId) {
  if (id.startsWith('7') && id.length > 4) return 'tritura';
  if (id.startsWith('9') && id.length > 4) return 'cemara';
  const num = parseInt(id, 10);
  if (!isNaN(num) && num >= 1 && num <= 1500) return 'cp';
  if (cabangId) {
    const c = cabangId.toLowerCase();
    if (c.includes('tritura')) return 'tritura';
    if (c.includes('cemara')) return 'cemara';
    if (c.includes('timor') || c.includes('cp')) return 'cp';
  }
  return 'cp';
}

async function main() {
  const lines = rawText.split(/\r?\n/);
  console.log(`Total raw lines: ${lines.length}`);

  let successCount = 0;

  // Skip header line if present
  let startIndex = 0;
  if (lines[0] && lines[0].includes('Name\tID')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = line.split('\t').map(c => c.trim());
    
    // Column index mapping based on TSV header:
    // 0: Name, 1: ID, 2: First Name, 3: Last Name, 4: Gender, 5: Date of Birth, 6: Nama Sekolah, 7: Kelas, 8: Contact/Whatsapp, 9: Email, 10: Location, 11: Start Date, 12: Active/Expired, 13: Cleaned Program, 14: MEMBERSHIP FROM AE2, 15: (Empty/Branch), 16: CLASS, 17: HOUSE, 18: Level, 19: House Role, 20: Contact number, 21: Homeroom, 22: Cabang Kelas

    const trainee_id = cols[1];
    if (!trainee_id || !trainee_id.match(/^\d+$/)) continue;

    const name = cols[0] || (cols[2] ? cols[2] + ' ' + (cols[3] || '') : '');
    const gender = cols[4] || null;
    const dob = parseDateStr(cols[5]);
    const school_name = cols[6] || null;
    const first_enroll = parseDateStr(cols[11]);
    const program = cols[13] || null;
    const cabang_ae2 = cols[15] || null;
    const class_name = cols[16] || null;
    const house = cols[17] || null;
    const level = cols[18] || null;
    const trainee_homeroom = cols[21] || null;
    const cabang_kelas = cols[22] || null;

    const branch_id = getBranch(trainee_id, cabang_kelas || cabang_ae2);

    await db.query(`
      INSERT INTO portal_trainee (
        trainee_id, name, gender, date_of_birth, school_name, program,
        branch_id, first_enroll, class, house, level, trainee_homeroom
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (trainee_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, portal_trainee.name),
        gender = COALESCE(EXCLUDED.gender, portal_trainee.gender),
        date_of_birth = COALESCE(EXCLUDED.date_of_birth, portal_trainee.date_of_birth),
        school_name = COALESCE(EXCLUDED.school_name, portal_trainee.school_name),
        program = COALESCE(EXCLUDED.program, portal_trainee.program),
        branch_id = COALESCE(EXCLUDED.branch_id, portal_trainee.branch_id),
        first_enroll = COALESCE(EXCLUDED.first_enroll, portal_trainee.first_enroll),
        class = COALESCE(EXCLUDED.class, portal_trainee.class),
        house = COALESCE(EXCLUDED.house, portal_trainee.house),
        level = COALESCE(EXCLUDED.level, portal_trainee.level),
        trainee_homeroom = COALESCE(EXCLUDED.trainee_homeroom, portal_trainee.trainee_homeroom)
    `, [
      trainee_id, name, gender, dob, school_name, program,
      branch_id, first_enroll, class_name, house, level, trainee_homeroom
    ]);

    const defaultPassword = 'SML' + trainee_id;
    const passHash = await bcrypt.hash(defaultPassword, 10);
    await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password)
      VALUES ($1, $2, $3)
      ON CONFLICT (student_id) DO UPDATE SET
        plain_password = COALESCE(login_trainee.plain_password, EXCLUDED.plain_password)
    `, [trainee_id, passHash, defaultPassword]);

    successCount++;
  }

  console.log(`Successfully processed & upserted ${successCount} TSV trainee records into portal_trainee & login_trainee.`);
}

main().catch(console.error);
