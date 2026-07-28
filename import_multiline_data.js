const fs = require('fs');
const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

const rawText = fs.readFileSync(__dirname + '/raw_multiline_input.txt', 'utf8');

const lines = rawText.split(/\r?\n/).map(l => l.trim());

let recordLines = [];
let started = false;
for (const line of lines) {
  if (!started) {
    if (line === '24') {
      started = true;
    } else {
      continue;
    }
  }
  recordLines.push(line);
}

let recordsRaw = [];
let currentChunk = [];

for (const line of recordLines) {
  if (/^\d+$/.test(line) && line.length <= 10) {
    if (currentChunk.length > 0) {
      recordsRaw.push(currentChunk);
    }
    currentChunk = [line];
  } else {
    currentChunk.push(line);
  }
}
if (currentChunk.length > 0) {
  recordsRaw.push(currentChunk);
}

console.log(`Found ${recordsRaw.length} candidate raw records.`);

function parseDateStr(str) {
  if (!str) return null;
  const cleaned = str.trim();
  if (!cleaned || cleaned === '-' || cleaned.toLowerCase() === 'null') return null;

  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      let [m, d, y] = parts;
      m = m.padStart(2, '0');
      d = d.padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

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

function getBranch(idStr, cabangStr, cabangKelasStr) {
  const c = (cabangStr || cabangKelasStr || '').toUpperCase();
  if (c.includes('CEMARA')) return 'cemara';
  if (c.includes('TRITURA')) return 'tritura';
  if (c.includes('TIMOR')) return 'cp';

  if (idStr.startsWith('7') && idStr.length > 4) return 'tritura';
  if (idStr.startsWith('9') && idStr.length > 4) return 'cemara';
  return 'cp';
}

function parseRecord(chunk) {
  const id = chunk[0];
  if (!/^\d+$/.test(id)) return null;

  let record = {
    trainee_id: id,
    name: null,
    gender: null,
    date_of_birth: null,
    school_name: null,
    program: null,
    membership_expired_date: null,
    branch_id: null,
    first_enroll: null,
    class: null,
    house: null,
    level: null,
    house_role: null,
    newest_grade: null,
    trainee_homeroom: null,
    screening_test_url: null
  };

  let nonUrlLines = [];
  for (let i = 1; i < chunk.length; i++) {
    const item = chunk[i];
    if (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('[http')) {
      let url = item.replace(/^\[/, '').replace(/\]$/, '');
      if (url.includes('](')) {
        url = url.split('](')[0];
      }
      record.screening_test_url = url.trim();
    } else {
      nonUrlLines.push(item);
    }
  }

  let i = 0;
  if (nonUrlLines.length > i && !['male', 'female'].includes(nonUrlLines[i].toLowerCase()) && !parseDateStr(nonUrlLines[i])) {
    const potentialName = nonUrlLines[i++];
    if (potentialName.includes('(') && potentialName.includes(')')) {
      // Class header line, not a person
      return null;
    }
    record.name = potentialName;
  }

  if (!record.name) return null;

  if (nonUrlLines.length > i && ['male', 'female'].includes(nonUrlLines[i].toLowerCase())) {
    record.gender = nonUrlLines[i++];
  }

  if (nonUrlLines.length > i && parseDateStr(nonUrlLines[i]) && !nonUrlLines[i].includes('2026') && !nonUrlLines[i].includes('2027')) {
    record.date_of_birth = parseDateStr(nonUrlLines[i++]);
  }

  let cabangStr = '';
  let cabangKelasStr = '';

  for (; i < nonUrlLines.length; i++) {
    const val = nonUrlLines[i];
    const valLower = val.toLowerCase();

    if (valLower.includes('program')) {
      record.program = val;
    } else if (valLower === 'active' || valLower === 'active (grace period)' || valLower === 'in progress') {
      // status, skip
    } else if (val === 'TIMOR' || val === 'TRITURA' || val === 'CEMARA') {
      if (!cabangStr) cabangStr = val;
      else cabangKelasStr = val;
    } else if (val.startsWith('House of ')) {
      record.house = val;
    } else if (['sergeant', 'general', 'colonel', 'lt. colonel', 'private', 'lt. general'].includes(valLower)) {
      record.house_role = val;
    } else if (parseDateStr(val)) {
      const parsedDate = parseDateStr(val);
      const year = parseInt(parsedDate.substring(0, 4), 10);
      if (year >= 2026 && !record.membership_expired_date) {
        record.membership_expired_date = parsedDate;
      } else if (year >= 2018 && year <= 2025 && !record.first_enroll) {
        record.first_enroll = parsedDate;
      } else if (!record.date_of_birth && year <= 2020) {
        record.date_of_birth = parsedDate;
      }
    } else if (['gghaitsa', 'ghaitsa', 'muly', 'rizky', 'agustina', 'loita'].includes(valLower)) {
      record.trainee_homeroom = val;
    } else if (/^\d{1,2}$/.test(val) && parseInt(val, 10) <= 12) {
      if (!record.newest_grade) record.newest_grade = val;
      else if (!record.level) record.level = val;
    } else if (val.includes('(') || ['obsidian', 'millman', 'spielberg', 'kiyosaki', 'doyle', 'graham', 'davinci', 'newton', 'jade', 'alexandrite', 'sigmund', 'clinton', 'sapphire', 'ruby', 'gladwell', 'grande', 'topaz', 'robbins', 'mandela', 'pearl', 'beryl', 'lincoln', 'hogwarts', 'wonderland', 'neverland', 'narnia', 'whomville', 'camelot', 'socrates', 'plato', 'einsten', 'einstein', 'aristotle', 'ziglar', 'canfield', 'whittier'].some(k => valLower.includes(k))) {
      record.class = val;
    } else if (!record.school_name && !record.class && val.length > 2) {
      record.school_name = val;
    }
  }

  record.branch_id = getBranch(id, cabangStr, cabangKelasStr);
  return record;
}

async function run() {
  const parsedRecords = [];
  for (const chunk of recordsRaw) {
    const rec = parseRecord(chunk);
    if (rec && rec.name) {
      parsedRecords.push(rec);
    }
  }

  console.log(`Successfully parsed ${parsedRecords.length} valid trainee records.`);

  let upsertedCount = 0;
  for (const rec of parsedRecords) {
    await db.query(`
      INSERT INTO portal_trainee (
        trainee_id, name, gender, date_of_birth, school_name, program,
        membership_expired_date, branch_id, first_enroll, class, house,
        level, trainee_homeroom, screening_test_url, newest_grade
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (trainee_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, portal_trainee.name),
        gender = COALESCE(EXCLUDED.gender, portal_trainee.gender),
        date_of_birth = COALESCE(EXCLUDED.date_of_birth, portal_trainee.date_of_birth),
        school_name = COALESCE(EXCLUDED.school_name, portal_trainee.school_name),
        program = COALESCE(EXCLUDED.program, portal_trainee.program),
        membership_expired_date = COALESCE(EXCLUDED.membership_expired_date, portal_trainee.membership_expired_date),
        branch_id = COALESCE(EXCLUDED.branch_id, portal_trainee.branch_id),
        first_enroll = COALESCE(EXCLUDED.first_enroll, portal_trainee.first_enroll),
        class = COALESCE(EXCLUDED.class, portal_trainee.class),
        house = COALESCE(EXCLUDED.house, portal_trainee.house),
        level = COALESCE(EXCLUDED.level, portal_trainee.level),
        trainee_homeroom = COALESCE(EXCLUDED.trainee_homeroom, portal_trainee.trainee_homeroom),
        screening_test_url = COALESCE(EXCLUDED.screening_test_url, portal_trainee.screening_test_url),
        newest_grade = COALESCE(EXCLUDED.newest_grade, portal_trainee.newest_grade)
    `, [
      rec.trainee_id, rec.name, rec.gender, rec.date_of_birth, rec.school_name, rec.program,
      rec.membership_expired_date, rec.branch_id, rec.first_enroll, rec.class, rec.house,
      rec.level, rec.trainee_homeroom, rec.screening_test_url, rec.newest_grade
    ]);

    const defaultPassword = 'SML' + rec.trainee_id;
    const passHash = await bcrypt.hash(defaultPassword, 10);

    await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password)
      VALUES ($1, $2, $3)
      ON CONFLICT (student_id) DO UPDATE SET
        plain_password = COALESCE(login_trainee.plain_password, EXCLUDED.plain_password)
    `, [rec.trainee_id, passHash, defaultPassword]);

    upsertedCount++;
  }

  console.log(`Upserted ${upsertedCount} records to portal_trainee & login_trainee successfully.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error running import:', err);
  process.exit(1);
});
