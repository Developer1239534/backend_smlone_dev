const fs = require('fs');
const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

const rawText = fs.readFileSync(__dirname + '/raw_trainee_input.txt', 'utf8');

function parseDateStr(str) {
  if (!str) return null;
  const cleaned = str.trim();
  if (!cleaned || cleaned === '-' || cleaned.toLowerCase() === 'null') return null;

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
  const lines = rawText.split(/\r?\n/).map(l => l.trim());

  const blocks = [];
  let currentBlock = [];

  for (const line of lines) {
    if (!line) continue;
    const idMatch = line.match(/^(\d{1,8})\b/);
    if (idMatch && (currentBlock.length === 0 || currentBlock.length >= 4)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  console.log(`Found ${blocks.length} raw trainee blocks`);

  let successCount = 0;

  for (const block of blocks) {
    const tokens = [];
    for (const item of block) {
      const parts = item.split('\t').map(p => p.trim()).filter(Boolean);
      tokens.push(...parts);
    }

    if (tokens.length < 2) continue;

    const trainee_id = tokens[0];
    const name = tokens[1];

    let gender = null;
    let dob = null;
    let school_name = null;
    let program = null;
    let membership_status = null;
    let membership_expired_date = null;
    let cabang_id = null;
    let first_enroll = null;
    let class_name = null;
    let house = null;
    let level = null;
    let screening_test_url = null;

    for (let i = 2; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.startsWith('http://') || tok.startsWith('https://')) {
        screening_test_url = tok;
      } else if (tok === 'Male' || tok === 'Female') {
        gender = tok;
      } else if (tok.includes('Program')) {
        program = tok;
      } else if (tok === 'Active' || tok.includes('Active (Grace Period)')) {
        membership_status = tok;
      } else if (tok === 'TIMOR' || tok === 'TRITURA' || tok === 'CEMARA') {
        if (!cabang_id) cabang_id = tok;
      } else if (tok.startsWith('House of ')) {
        house = tok;
      } else if (['Private', 'Sergeant', 'Colonel', 'Lt. Colonel', 'General', 'Lt. General'].includes(tok)) {
        level = tok;
      } else {
        const parsedDate = parseDateStr(tok);
        if (parsedDate) {
          if (!membership_expired_date && (tok.includes('202') || tok.includes('201') || tok.match(/\b\d{2}\b/))) {
            if (parseInt(parsedDate.substring(0, 4), 10) >= 2026) {
              membership_expired_date = parsedDate;
            } else if (!first_enroll) {
              first_enroll = parsedDate;
            }
          } else if (!first_enroll) {
            first_enroll = parsedDate;
          }
        }
      }
    }

    for (let i = 2; i < tokens.length; i++) {
      const tok = tokens[i];
      if (![gender, program, membership_status, cabang_id, house, level, screening_test_url].includes(tok) && !parseDateStr(tok)) {
        if (tok.includes('(') || ['Obsidian', 'Millman', 'Spielberg', 'Kiyosaki', 'Doyle', 'Graham', 'DaVinci', 'Newton', 'Jade', 'Alexandrite', 'Sigmund', 'Clinton', 'Sapphire', 'Ruby', 'Gladwell', 'Grande', 'Topaz', 'Robbins', 'Mandela', 'Pearl', 'Gates', 'Galileo', 'Tracy', 'Canfield', 'Winfrey', 'Lincoln', 'Dale', 'Maxwell', 'Ziglar', 'Socrates', 'Aristotle', 'Plato', 'Einstein', 'Denver', 'Cairo', 'Athens', 'Atlanta', 'Asheville', 'Auckland', 'Almeria', 'Eldorado', 'Amber', 'Quartz', 'Sherwood Forest', 'Hogwarts', 'Wonderland', 'Neverland', 'Camelot', 'Whomville', 'Narnia', 'Beryl'].some(c => tok.includes(c))) {
          if (!class_name) class_name = tok;
        } else if (tok.length > 3 && !school_name && !tok.match(/^\d+$/)) {
          school_name = tok;
        }
      }
    }

    const branch_id = getBranch(trainee_id, cabang_id);

    await db.query(`
      INSERT INTO portal_trainee (
        trainee_id, name, gender, date_of_birth, school_name, program,
        membership_expired_date, branch_id, first_enroll, class, house, level, screening_test_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        screening_test_url = COALESCE(EXCLUDED.screening_test_url, portal_trainee.screening_test_url)
    `, [
      trainee_id, name, gender, dob, school_name, program,
      membership_expired_date, branch_id, first_enroll, class_name, house, level, screening_test_url
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

  console.log(`Successfully processed & upserted ${successCount} trainee records into portal_trainee & login_trainee.`);
}

main().catch(console.error);
