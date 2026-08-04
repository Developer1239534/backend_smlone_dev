const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🚀 Parsing and batch upserting huge dataset into login_portal_fix...');

  // Ensure column lengths
  await db.query(`
    ALTER TABLE login_portal_fix ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN gender TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN password TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN wa_trainee TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN email TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN wa_orang_tua TYPE VARCHAR(255);
    ALTER TABLE login_portal_fix ALTER COLUMN kategori TYPE VARCHAR(255);
  `);

  const logPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\9beb73e7-e676-4eaa-a35f-bc916c6c9b49\\.system_generated\\logs\\transcript_full.jsonl';
  const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
  
  let lastUserMsg = '';
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        lastUserMsg = obj.content;
      }
    } catch(e) {}
  }

  const dataLines = lastUserMsg.split('\n').map(l => l.trim()).filter(l => l !== '');
  
  // Find start index after header
  let startIdx = 0;
  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i].toLowerCase().includes('last real stage')) {
      startIdx = i + 1;
      break;
    }
  }

  const rawTokens = dataLines.slice(startIdx);
  const trainees = [];
  
  let i = 0;
  while (i < rawTokens.length) {
    const candidateId = rawTokens[i];
    const candidateName = rawTokens[i + 1] || '';
    const candidateGender = rawTokens[i + 2] || '';

    if (/^\d+$/.test(candidateId) && (candidateGender === 'Male' || candidateGender === 'Female')) {
      const id = candidateId;
      const name = candidateName;
      const gender = candidateGender;

      let cursor = i + 3;
      // Find end of this trainee block (where next trainee starts with ID + Name + Gender)
      let endBlock = rawTokens.length;
      for (let j = cursor; j < rawTokens.length - 2; j++) {
        if (/^\d+$/.test(rawTokens[j]) && (rawTokens[j + 2] === 'Male' || rawTokens[j + 2] === 'Female')) {
          endBlock = j;
          break;
        }
      }

      let date_of_birth = null;
      let nama_sekolah = '';
      let cleaned_program = 'Junior/Youth Program';
      let membership = 'Active';
      let expiry_date = null;
      let cabang_id = 'TIMOR';
      let first_enroll = null;
      let class_name = '';
      let house = '';
      let level = '';
      let house_role = '';
      let cabang_kelas = 'TIMOR';
      let newest_grade = '';
      let trainee_homeroom = '';
      let screening_test = '';
      let draft_grade = '';
      let prev_grade = '';
      let ajy_by_class = '';
      let last_real_stage = null;

      const parseDateStr = (str) => {
        if (!str) return null;
        const m = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
        if (!m) return null;
        const day = parseInt(m[1], 10);
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = monthNames.indexOf(m[2].toLowerCase().slice(0, 3));
        if (month === -1) return null;
        let year = parseInt(m[3], 10);
        if (year < 100) {
          year = year > 30 ? 1900 + year : 2000 + year;
        }
        const d = new Date(Date.UTC(year, month, day));
        return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
      };

      const tokens = rawTokens.slice(i, endBlock);

      // Process tokens for this trainee
      for (let k = 3; k < tokens.length; k++) {
        const tok = tokens[k];
        if (tok.startsWith('https://') || tok.startsWith('http://') || tok.includes('drive.google.com')) {
          const match = tok.match(/\[(.*?)\]\((.*?)\)/);
          if (match) screening_test = match[2];
          else screening_test = tok;
        } else if (!date_of_birth && parseDateStr(tok)) {
          date_of_birth = parseDateStr(tok);
        } else if (!expiry_date && parseDateStr(tok)) {
          expiry_date = parseDateStr(tok);
        } else if (!first_enroll && parseDateStr(tok)) {
          first_enroll = parseDateStr(tok);
        } else if (parseDateStr(tok)) {
          last_real_stage = parseDateStr(tok);
        } else if (tok === 'Active' || tok.includes('Active')) {
          membership = tok;
        } else if (tok === 'TIMOR' || tok === 'CEMARA' || tok === 'TRITURA') {
          if (!cabang_id) cabang_id = tok;
          else cabang_kelas = tok;
        } else if (tok.startsWith('House of ')) {
          house = tok;
        } else if (['Private', 'Sergeant', 'Colonel', 'Lt. Colonel', 'General', 'Lt. General'].includes(tok)) {
          if (!level) level = tok;
          else house_role = tok;
        } else if (['Youth', 'Junior', 'Apprentice'].includes(tok)) {
          ajy_by_class = tok;
        } else if (['Ghaitsa', 'Muly', 'Rizky', 'Loita', 'Agustina', 'Nabilah'].includes(tok)) {
          trainee_homeroom = tok;
        } else if (!class_name && (tok.includes('(') || ['Obsidian', 'Millman', 'Spielberg', 'Kiyosaki', 'Doyle', 'Graham', 'DaVinci', 'Grande', 'Jade', 'Alexandrite', 'Sigmund', 'Clinton', 'Sapphire', 'Ruby', 'Gladwell', 'Topaz', 'Robbins', 'Mandela', 'Pearl', 'Neverland', 'Gates', 'Aristotle', 'Tracy', 'Lincoln', 'Wonderland', 'Canfield', 'Gandhi', 'Hogwarts', 'Amber', 'Quartz', 'Diamond', 'Azurite', 'Emerald', 'Beryl', 'Amethyst', 'Avalon', 'Sherwood Forest', 'Duloc', 'Socrates', 'Plato', 'Narnia', 'Athens', 'Almeria', 'Denver', 'Auckland', 'Cairo', 'Eldorado', 'Atlanta', 'Asheville', 'Whomville', 'Atlantis'].some(c => tok.includes(c)))) {
          class_name = tok;
        } else if (!nama_sekolah && tok !== 'Junior/Youth Program' && !/^\d+$/.test(tok)) {
          nama_sekolah = tok;
        } else if (/^\d+$/.test(tok)) {
          if (!newest_grade) newest_grade = tok;
          else if (!draft_grade) draft_grade = tok;
          else if (!prev_grade) prev_grade = tok;
        }
      }

      if (!house_role) house_role = level;

      trainees.push({
        id,
        name,
        gender,
        date_of_birth,
        nama_sekolah,
        cleaned_program,
        membership,
        expiry_date,
        cabang_id,
        first_enroll,
        class: class_name,
        house,
        level,
        house_role,
        cabang_kelas,
        newest_grade,
        trainee_homeroom,
        screening_test,
        draft_grade,
        prev_grade,
        ajy_by_class,
        last_real_stage
      });

      i = cursor;
    } else {
      i++;
    }
  }

  console.log(`Parsed ${trainees.length} raw trainee entries from input text.`);

  // Deduplicate trainees by ID (keep latest)
  const uniqueMap = new Map();
  for (const t of trainees) {
    uniqueMap.set(t.id, t);
  }
  const uniqueTrainees = Array.from(uniqueMap.values());
  console.log(`Deduplicated to ${uniqueTrainees.length} unique trainees by ID.`);

  // Batch insert into login_portal_fix
  const BATCH_SIZE = 25;
  let inserted = 0;

  for (let b = 0; b < uniqueTrainees.length; b += BATCH_SIZE) {
    const chunk = uniqueTrainees.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];

    chunk.forEach((t, idx) => {
      const base = idx * 23;
      const password = `SML${t.id.toUpperCase()}`;
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

    await db.query(query, params);
    inserted += chunk.length;
    console.log(`Upserted batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(trainees.length / BATCH_SIZE)} (${inserted}/${trainees.length})`);
  }

  // Sync names with report_trainee
  console.log('🔄 Syncing report_trainee names...');
  await db.query(`
    UPDATE report_trainee r
    SET name = l.name, updated_at = NOW()
    FROM login_portal_fix l
    WHERE LOWER(r.id::text) = LOWER(l.id::text) OR LOWER(r.trainee_id::text) = LOWER(l.id::text);
  `);
  console.log('✅ Synchronized report_trainee names!');

  process.exit(0);
}

main().catch(console.error);
