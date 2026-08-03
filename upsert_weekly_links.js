const fs = require('fs');
const db = require('./src/db/neonClient');

function cleanClass(cls) {
  if (!cls) return '';
  return cls.replace(/\(Sat 4-6\)/gi, '').trim();
}

function cleanProgram(prog) {
  if (!prog) return '';
  if (prog.toLowerCase().includes('junior/youth')) {
    return 'Core/Orator Society Program';
  }
  return prog.trim();
}

function extractWeeklyLink(str) {
  if (!str) return '';
  const match = str.match(/https:\/\/docs\.google\.com\/spreadsheets\/[^\s\)\"]+/);
  return match ? match[0] : str.trim();
}

async function upsertWeeklyLinks() {
  console.log('1. Ensuring columns exist in link_report...');
  await db.query(`
    ALTER TABLE link_report
    ADD COLUMN IF NOT EXISTS program VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cleaned_program VARCHAR(255),
    ADD COLUMN IF NOT EXISTS class VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cleaned_class VARCHAR(255),
    ADD COLUMN IF NOT EXISTS link_weekly TEXT;
  `);
  console.log('✅ Columns verified.');

  console.log('2. Reading and parsing latest user prompt data...');
  const content = fs.readFileSync('latest_user_prompt.txt', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('<USER_REQUEST>') && !l.startsWith('</USER_REQUEST>'));

  const records = [];

  // Parse horizontal top block (lines 2-5)
  const topNames = [
    'Nicholas Matthew Halim', 'Novriciella Carina Luthan', 'Candice Chrystalline Liangrich',
    'Jivaka Putra', 'No registration', 'Erich Legolas Cen', 'Bryan Legolas Cen',
    'Valerie Legolas Cen', 'Raynard Fausta'
  ];
  const topClasses = [
    'Einstein (Sat 1-3)', 'Dale (Sat 4-6)', 'Clinton (Fri 3-5)',
    'Confidence Class D3', 'Waiting List', 'Confidence Class D3',
    'Obsidian', 'Millman (Sat 1-3)', ''
  ];
  const topLinksLine = lines.find(l => l.includes('https://docs.google.com/spreadsheets'));
  const topLinks = topLinksLine ? topLinksLine.split(/\s+/).filter(l => l.includes('http')) : [];

  topNames.forEach((n, idx) => {
    if (n !== 'No registration') {
      records.push({
        id: `TOP_${idx + 1}`,
        nama: n,
        program: 'Junior/Youth Program',
        cleaned_program: 'Core/Orator Society Program',
        class: topClasses[idx] || '',
        cleaned_class: cleanClass(topClasses[idx] || ''),
        link_weekly: topLinks[idx] ? extractWeeklyLink(topLinks[idx]) : ''
      });
    }
  });

  // Vertical block parsing
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\d+$/.test(line)) {
      const id = line;
      let nama = lines[i+1] || '';
      let prog = lines[i+2] || '';
      let cls = lines[i+3] || '';
      let link = lines[i+4] || '';

      if (nama === 'No registration') {
        i += 2;
        continue;
      }

      if (cls.includes('http')) {
        link = cls;
        cls = '';
        i += 4;
      } else if (link.includes('http')) {
        i += 5;
      } else {
        link = '';
        i += 4;
      }

      records.push({
        id,
        nama,
        program: prog,
        cleaned_program: cleanProgram(prog),
        class: cls,
        cleaned_class: cleanClass(cls),
        link_weekly: extractWeeklyLink(link)
      });
    } else {
      i++;
    }
  }

  console.log(`Parsed ${records.length} records.`);

  // Load existing records from database for matching by ID or Name
  const existingRows = (await db.query('SELECT trainee_id, nama, term FROM link_report')).rows;
  const idMap = new Map();
  const nameMap = new Map();

  const norm = str => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  existingRows.forEach(r => {
    if (r.trainee_id) idMap.set(r.trainee_id.trim().toLowerCase(), r);
    if (r.nama) nameMap.set(norm(r.nama), r);
  });

  console.log('3. Preparing bulk UPSERT operations...');
  const upsertList = [];
  const termDefault = 'May 2026 - Jun 2026';

  for (const r of records) {
    let matchedDB = null;

    if (r.id && idMap.has(r.id.trim().toLowerCase())) {
      matchedDB = idMap.get(r.id.trim().toLowerCase());
    } else if (r.nama && nameMap.has(norm(r.nama))) {
      matchedDB = nameMap.get(norm(r.nama));
    }

    const trainee_id = matchedDB ? matchedDB.trainee_id : r.id;
    const term = matchedDB ? matchedDB.term : termDefault;

    upsertList.push({
      trainee_id,
      term,
      nama: r.nama,
      program: r.program,
      cleaned_program: r.cleaned_program,
      class: r.class,
      cleaned_class: r.cleaned_class,
      link_weekly: r.link_weekly
    });
  }

  // Execute UPSERT in chunks of 100
  const chunkSize = 100;
  for (let c = 0; c < upsertList.length; c += chunkSize) {
    const chunk = upsertList.slice(c, c + chunkSize);
    const values = [];
    const placeholders = [];

    chunk.forEach((item, idx) => {
      const b = idx * 8;
      placeholders.push(`($${b+1}, $${b+2}, $${b+3}, $${b+4}, $${b+5}, $${b+6}, $${b+7}, $${b+8})`);
      values.push(
        item.trainee_id,
        item.term,
        item.nama,
        item.program,
        item.cleaned_program,
        item.class,
        item.cleaned_class,
        item.link_weekly
      );
    });

    const queryStr = `
      INSERT INTO link_report (trainee_id, term, nama, program, cleaned_program, class, cleaned_class, link_weekly)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (trainee_id, term) DO UPDATE SET
        nama = COALESCE(EXCLUDED.nama, link_report.nama),
        program = EXCLUDED.program,
        cleaned_program = EXCLUDED.cleaned_program,
        class = EXCLUDED.class,
        cleaned_class = EXCLUDED.cleaned_class,
        link_weekly = EXCLUDED.link_weekly;
    `;

    await db.query(queryStr, values);
    console.log(`Upserted chunk ${Math.floor(c / chunkSize) + 1}`);
  }

  console.log('✅ Bulk UPSERT finished successfully!');

  // Query final statistics
  const resStats = await db.query(`
    SELECT 
      COUNT(*) AS total_rows,
      COUNT(program) AS program_count,
      COUNT(cleaned_program) AS cleaned_program_count,
      COUNT(class) AS class_count,
      COUNT(cleaned_class) AS cleaned_class_count,
      COUNT(link_weekly) AS link_weekly_count
    FROM link_report;
  `);

  console.log('\n=========================================');
  console.log('📊 FINAL DATABASE SUMMARY (link_report):');
  console.log('Total rows:', resStats.rows[0].total_rows);
  console.log('Rows with program:', resStats.rows[0].program_count);
  console.log('Rows with cleaned_program (Core/Orator Society Program):', resStats.rows[0].cleaned_program_count);
  console.log('Rows with class:', resStats.rows[0].class_count);
  console.log('Rows with cleaned_class (removed (Sat 4-6)):', resStats.rows[0].cleaned_class_count);
  console.log('Rows with link_weekly:', resStats.rows[0].link_weekly_count);
  console.log('=========================================\n');
}

upsertWeeklyLinks().catch(console.error).then(() => process.exit(0));
