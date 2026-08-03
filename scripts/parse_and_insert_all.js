const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

function parseCustomDate(str) {
  if (!str) return null;
  const clean = str.trim();
  if (!clean || clean.length < 5) return null;

  const match2DigitYear = clean.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2})$/);
  if (match2DigitYear) {
    const day = match2DigitYear[1].padStart(2, '0');
    const monthStr = match2DigitYear[2];
    let yy = parseInt(match2DigitYear[3], 10);
    const fullYear = yy <= 30 ? 2000 + yy : 1900 + yy;

    const d = new Date(`${day} ${monthStr} ${fullYear}`);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      if (year >= 1900 && year <= 2099) {
        return d.toISOString().split('T')[0];
      }
    }
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    if (year >= 1900 && year <= 2099) {
      return d.toISOString().split('T')[0];
    }
  }
  return null;
}

async function run() {
  console.log('🚀 Re-importing dataset into login_portal_fix (without screening_test)...');
  
  // Read prompt file
  const promptPath = path.join(__dirname, 'full_user_prompt.txt');
  if (!fs.existsSync(promptPath)) {
    console.error('File not found:', promptPath);
    process.exit(1);
  }
  let text = fs.readFileSync(promptPath, 'utf8');

  if (text.includes('<USER_REQUEST>')) text = text.split('<USER_REQUEST>')[1];
  if (text.includes('</USER_REQUEST>')) text = text.split('</USER_REQUEST>')[0];

  const lines = text.split('\n').map(l => l.trim());

  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ID') && lines[i].includes('Name') && lines[i].includes('Gender')) {
      startIndex = i + 1;
      break;
    }
  }

  const records = [];
  let currentBlock = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const isId = /^\d+$/.test(line);
    const nextIsName = i + 1 < lines.length && lines[i + 1] && !/^\d+$/.test(lines[i + 1]) && !lines[i + 1].startsWith('http');

    if (isId && nextIsName) {
      if (currentBlock.length > 0) {
        records.push(currentBlock);
      }
      currentBlock = [line];
    } else if (currentBlock.length > 0) {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    records.push(currentBlock);
  }

  console.log(`📋 Total student blocks identified: ${records.length}`);

  const rowMap = new Map();

  for (const block of records) {
    const id = block[0];
    const name = block[1];

    if (!id || !name || !/^\d+$/.test(id)) continue;

    let gender = null;
    let date_of_birth = null;
    let nama_sekolah = null;
    let cleaned_program = 'Core/Orator Society';
    let membership = null;
    let expiry_date = null;
    let cabang_id = null;
    let first_enroll = null;
    let className = null;
    let house = null;
    let level = null;
    let house_role = null;
    let cabang_kelas = null;
    let newest_grade = null;
    let trainee_homeroom = null;
    let draft_grade = null;
    let prev_grade = null;
    let ajy_by_class = null;
    let last_real_stage = null;

    const datesFound = [];

    for (let k = 2; k < block.length; k++) {
      const val = block[k];
      if (!val) continue;

      if (val === 'Male' || val === 'Female') {
        gender = val;
      } else if (val.startsWith('Active') || val.startsWith('Expired')) {
        membership = val;
      } else if (val === 'TIMOR' || val === 'CEMARA' || val === 'TRITURA') {
        if (!cabang_id) cabang_id = val;
        else cabang_kelas = val;
      } else if (val.startsWith('House of ')) {
        house = val;
      } else if (['Sergeant', 'General', 'Lt. Colonel', 'Colonel', 'Lt. General', 'Private', 'Apprentice'].includes(val)) {
        house_role = val;
      } else if (['Youth', 'Junior', 'Apprentice'].includes(val)) {
        ajy_by_class = val;
      } else if (val.startsWith('http') || val.includes('drive.google.com')) {
        continue;
      } else if (val.includes('Program') || val.includes('Professionals')) {
        if (val === 'Junior/Youth Program') {
          cleaned_program = 'Core/Orator Society';
        } else {
          cleaned_program = val;
        }
      } else {
        const parsedDt = parseCustomDate(val);
        if (parsedDt) {
          datesFound.push(parsedDt);
        } else if (/^\d{1,2}$/.test(val)) {
          if (!level) level = val;
          else if (!newest_grade) newest_grade = val;
          else if (!draft_grade) draft_grade = val;
          else if (!prev_grade) prev_grade = val;
        } else if (['Agustina', 'Ghaitsa', 'Muly', 'Loita', 'Rizky', 'Nabilah'].includes(val)) {
          trainee_homeroom = val;
        } else {
          if (!className && (val.includes('(') || val.includes('Class') || ['Einstein', 'Dale', 'Clinton', 'Millman', 'Kiyosaki', 'Winfrey', 'Doyle', 'Spielberg', 'Ziglar', 'Tracy', 'Robbins', 'Gladwell', 'Mandela', 'DaVinci', 'Newton', 'Maxwell', 'Sigmund', 'Obsidian', 'Ruby', 'Sapphire', 'Jade', 'Alexandrite', 'Topaz', 'Pearl', 'Amber', 'Hogwarts', 'Wonderland', 'Neverland', 'Whomville', 'Camelot', 'Narnia', 'Denver', 'Lincoln', 'Graham', 'Asheville', 'Canfield', 'Beryl', 'Cairo', 'Auckland', 'Atlanta', 'Eldorado', 'Sherwood Forest', 'Athens', 'Almeria', 'Quartz', 'Diamond', 'Emerald', 'Azurite', 'Duloc', 'Atlantis', 'Plato', 'Socrates'].some(c => val.includes(c)))) {
            className = val;
          } else if (!nama_sekolah && val.length > 2) {
            nama_sekolah = val;
          }
        }
      }
    }

    if (datesFound.length > 0) date_of_birth = datesFound[0];
    if (datesFound.length > 1) expiry_date = datesFound[1];
    if (datesFound.length > 2) first_enroll = datesFound[2];
    if (datesFound.length > 3) last_real_stage = datesFound[3];

    const password = `SML${id}`;

    rowMap.set(id, {
      id, name, password, gender, date_of_birth, nama_sekolah, cleaned_program,
      membership, expiry_date, cabang_id, first_enroll, className, house, level,
      house_role, cabang_kelas, newest_grade, trainee_homeroom,
      draft_grade, prev_grade, ajy_by_class, last_real_stage
    });
  }

  const uniqueRows = Array.from(rowMap.values());
  console.log(`🚀 Executing BATCH UPSERT for ${uniqueRows.length} unique records...`);

  const BATCH_SIZE = 100;
  for (let i = 0; i < uniqueRows.length; i += BATCH_SIZE) {
    const chunk = uniqueRows.slice(i, i + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];

    chunk.forEach((row, idx) => {
      const offset = idx * 22;
      const placeholders = Array.from({ length: 22 }, (_, pIdx) => `$${offset + pIdx + 1}`).join(', ');
      valuePlaceholders.push(`(${placeholders}, NOW())`);

      params.push(
        row.id, row.name, row.password, row.gender, row.date_of_birth, row.nama_sekolah,
        row.cleaned_program, row.membership, row.expiry_date, row.cabang_id, row.first_enroll,
        row.className, row.house, row.level, row.house_role, row.cabang_kelas, row.newest_grade,
        row.trainee_homeroom, row.draft_grade, row.prev_grade,
        row.ajy_by_class, row.last_real_stage
      );
    });

    const batchSql = `
      INSERT INTO login_portal_fix (
        id, name, password, gender, date_of_birth, nama_sekolah, cleaned_program,
        membership, expiry_date, cabang_id, first_enroll, class, house, level,
        house_role, cabang_kelas, newest_grade, trainee_homeroom,
        draft_grade, prev_grade, ajy_by_class, last_real_stage, updated_at
      ) VALUES ${valuePlaceholders.join(', ')}
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
        draft_grade = EXCLUDED.draft_grade,
        prev_grade = EXCLUDED.prev_grade,
        ajy_by_class = EXCLUDED.ajy_by_class,
        last_real_stage = EXCLUDED.last_real_stage,
        updated_at = NOW();
    `;

    await db.query(batchSql, params);
    console.log(`  ✓ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(uniqueRows.length / BATCH_SIZE)} (${chunk.length} rows)`);
  }

  console.log('🎉 Re-import finished!');

  const countRes = await db.query('SELECT COUNT(*) FROM login_portal_fix');
  console.log('📊 Total rows in `login_portal_fix` table:', countRes.rows[0].count);

  const activeRes = await db.query("SELECT COUNT(*) FROM login_portal_fix WHERE membership ILIKE 'Active%'");
  console.log('📊 Active membership count:', activeRes.rows[0].count);

  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error executing import:', err);
  process.exit(1);
});
