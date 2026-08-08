const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function parseAndImport() {
  const content = fs.readFileSync(path.join(__dirname, 'full_user_prompt.txt'), 'utf8');

  // Strip <USER_REQUEST> tags and metadata
  let cleanedText = content;
  if (cleanedText.includes('<USER_REQUEST>')) {
    cleanedText = cleanedText.split('<USER_REQUEST>')[1];
  }
  if (cleanedText.includes('</USER_REQUEST>')) {
    cleanedText = cleanedText.split('</USER_REQUEST>')[0];
  }

  const lines = cleanedText.split('\n').map(l => l.trim());
  console.log(`Total raw lines: ${lines.length}`);

  // Find where data starts (after header)
  // Header contains: ID, Name, Gender, Date of Birth, etc.
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ID') && lines[i].includes('Name') && lines[i].includes('Gender')) {
      startIndex = i + 1;
      break;
    }
  }

  console.log(`Data starts at line index: ${startIndex}`);

  // We can group lines by student ID!
  // A student record starts with an ID line.
  // How to identify an ID line?
  // ID is a number (e.g. 20, 21, 22 ... 1128), and the NEXT non-empty line is a Name (starts with uppercase letter or name string, NOT a date or URL or number).

  const records = [];
  let currentRecordLines = [];

  function processRecordBlock(blockLines) {
    if (blockLines.length === 0) return;
    const studentId = blockLines[0];

    // Check if valid student ID (numeric string)
    if (!/^\d+$/.test(studentId)) return;

    // First line after ID is Name
    const name = blockLines[1] || '';
    if (!name) return;

    // Remaining lines contain fields
    // Let's inspect fields
    let gender = '';
    let dob = null;
    let school = '';
    let program = '';
    let membership = '';
    let expiry_date = null;
    let cabang_id = '';
    let first_enroll = null;
    let className = '';
    let house = '';
    let level = '';
    let house_role = '';
    let cabang_kelas = '';
    let newest_grade = '';
    let trainee_homeroom = '';
    let screening_test = '';
    let draft_grade = '';
    let prev_grade = '';
    let ajy_by_class = '';
    let last_real_stage = '';

    // Date parser helper
    const parseDate = (str) => {
      if (!str) return null;
      const s = str.trim();
      // Examples: "3 Apr 11", "9 Aug 2023", "09 Aug 2022", "2023-08-09", "11/04/2022"
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
      return null;
    };

    // Helper to check if string is gender
    const isGender = (s) => s === 'Male' || s === 'Female';

    // Helper to check if string is membership
    const isMembership = (s) => s.startsWith('Active') || s.startsWith('Expired') || s.startsWith('Grace');

    // Parse values from blockLines
    for (let k = 2; k < blockLines.length; k++) {
      const val = blockLines[k];
      if (!val) continue;

      if (isGender(val)) {
        gender = val;
      } else if (val.includes('Program') || val.includes('Professionals')) {
        program = val;
      } else if (isMembership(val)) {
        membership = val;
      } else if (val === 'TIMOR' || val === 'CEMARA' || val === 'TRITURA') {
        if (!cabang_id) cabang_id = val;
        else if (!cabang_kelas) cabang_kelas = val;
      } else if (val.startsWith('House of ')) {
        house = val;
      } else if (val === 'Sergeant' || val === 'General' || val === 'Lt. Colonel' || val === 'Colonel' || val === 'Lt. General' || val === 'Private' || val === 'Apprentice') {
        house_role = val;
      } else if (val === 'Youth' || val === 'Junior' || val === 'Apprentice') {
        ajy_by_class = val;
      } else if (val.startsWith('http')) {
        // drive link or screening test
        screening_test = val;
      } else if (parseDate(val)) {
        const parsed = parseDate(val);
        // Distinguish DOB vs Expiry vs First Enroll vs Last Real Stage
        if (!dob && k <= 4) dob = parsed;
        else if (!expiry_date && (membership || k <= 8)) expiry_date = parsed;
        else if (!first_enroll) first_enroll = parsed;
        else if (!last_real_stage) last_real_stage = parsed;
      } else {
        // Text field: school, class, homeroom, etc.
        if (!className && (val.includes('(') || val.includes('Class') || val.includes('Satisfied') || val.includes('Gladwell') || val.includes('Obsidian') || val.includes('Sigmund') || val.includes('Ruby') || val.includes('DaVinci') || val.includes('Narnia') || val.includes('Hogwarts') || val.includes('Mandela') || val.includes('Lincoln') || val.includes('Graham') || val.includes('Alexandrite') || val.includes('Amber') || val.includes('Topaz') || val.includes('Pearl') || val.includes('Beryl') || val.includes('Canfield') || val.includes('Asheville') || val.includes('Denver'))) {
          className = val;
        } else if (!school && val.length > 2 && !/^\d+$/.test(val)) {
          school = val;
        }
      }
    }

    // Apply User Requirements:
    // 1. Password: SML + studentId
    const password = `SML${studentId}`;

    // 2. Program: "Junior/Youth Program" -> "Core/Orator Society"
    let cleaned_program = program;
    if (!cleaned_program || cleaned_program === 'Junior/Youth Program') {
      cleaned_program = 'Core/Orator Society';
    }

    records.push({
      id: studentId,
      name,
      password,
      gender,
      date_of_birth: dob,
      nama_sekolah: school,
      cleaned_program,
      membership,
      expiry_date,
      cabang_id,
      first_enroll,
      class: className,
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
  }

  // Parse lines into records
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check if line starts a new record (a number, and next line is a name string)
    const isIdCandidate = /^\d+$/.test(line);
    const nextLineIsName = i + 1 < lines.length && lines[i + 1] && !/^\d+$/.test(lines[i + 1]) && !lines[i + 1].startsWith('http');

    if (isIdCandidate && nextLineIsName) {
      if (currentRecordLines.length > 0) {
        processRecordBlock(currentRecordLines);
      }
      currentRecordLines = [line];
    } else if (currentRecordLines.length > 0) {
      currentRecordLines.push(line);
    }
  }

  if (currentRecordLines.length > 0) {
    processRecordBlock(currentRecordLines);
  }

  console.log(`Parsed total ${records.length} records!`);
  console.log('Sample parsed record #1:', records[0]);
  console.log('Sample parsed record #2:', records[1]);
  console.log('Sample parsed record #5:', records[4]);

  return records;
}

parseAndImport();
