const fs = require('fs');
const db = require('./src/db/neonClient');

function cleanClass(cls) {
  if (!cls) return '';
  // User asked: 'untuk class hapus ini ya (Sat 4-6)'
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

async function processWeeklyLinks() {
  console.log('1. Altering link_report table to add new columns if not exist...');
  await db.query(`
    ALTER TABLE link_report
    ADD COLUMN IF NOT EXISTS program VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cleaned_program VARCHAR(255),
    ADD COLUMN IF NOT EXISTS class VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cleaned_class VARCHAR(255),
    ADD COLUMN IF NOT EXISTS link_weekly TEXT;
  `);
  console.log('✅ Columns added/verified.');

  console.log('2. Reading latest user prompt data...');
  const content = fs.readFileSync('latest_user_prompt.txt', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('<USER_REQUEST>') && !l.startsWith('</USER_REQUEST>'));

  const records = [];

  // Top horizontal block check (lines 2-5)
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
        id: null,
        nama: n,
        program: 'Junior/Youth Program',
        cleaned_program: 'Core/Orator Society Program',
        class: topClasses[idx] || '',
        cleaned_class: cleanClass(topClasses[idx] || ''),
        link_weekly: topLinks[idx] ? extractWeeklyLink(topLinks[idx]) : ''
      });
    }
  });

  // Vertical block items parsing
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

  console.log(`Parsed total ${records.length} records.`);

  // Load existing database records for matching
  const existingRows = (await db.query('SELECT trainee_id, nama, term FROM link_report')).rows;
  const idMap = new Map();
  const nameMap = new Map();

  existingRows.forEach(r => {
    if (r.trainee_id) idMap.set(r.trainee_id.trim().toLowerCase(), r);
    if (r.nama) nameMap.set(r.nama.trim().toLowerCase(), r);
  });

  console.log('3. Updating database records...');
  let matchedCount = 0;
  let updateQueries = [];

  for (const r of records) {
    let target = null;
    if (r.id && idMap.has(r.id.trim().toLowerCase())) {
      target = idMap.get(r.id.trim().toLowerCase());
    } else if (r.nama && nameMap.has(r.nama.trim().toLowerCase())) {
      target = nameMap.get(r.nama.trim().toLowerCase());
    }

    if (target) {
      matchedCount++;
      updateQueries.push({
        trainee_id: target.trainee_id,
        term: target.term || 'May 2026 - Jun 2026',
        program: r.program,
        cleaned_program: r.cleaned_program,
        class: r.class,
        cleaned_class: r.cleaned_class,
        link_weekly: r.link_weekly
      });
    }
  }

  console.log(`Matched ${matchedCount} records out of ${records.length} parsed.`);

  // Batch update DB in chunks of 100
  const chunkSize = 100;
  for (let c = 0; c < updateQueries.length; c += chunkSize) {
    const chunk = updateQueries.slice(c, c + chunkSize);
    
    // Perform bulk update using UPDATE ... FROM (VALUES ...)
    const values = [];
    const valPlaceholders = [];

    chunk.forEach((item, idx) => {
      const base = idx * 7;
      valPlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`);
      values.push(
        item.trainee_id,
        item.term,
        item.program,
        item.cleaned_program,
        item.class,
        item.cleaned_class,
        item.link_weekly
      );
    });

    const queryStr = `
      UPDATE link_report AS lr SET
        program = v.program,
        cleaned_program = v.cleaned_program,
        class = v.class,
        cleaned_class = v.cleaned_class,
        link_weekly = v.link_weekly
      FROM (VALUES ${valPlaceholders.join(', ')}) AS v(trainee_id, term, program, cleaned_program, class, cleaned_class, link_weekly)
      WHERE lr.trainee_id = v.trainee_id AND lr.term = v.term;
    `;

    await db.query(queryStr, values);
    console.log(`Updated batch ${c / chunkSize + 1}`);
  }

  console.log('✅ Update completed successfully!');

  // Summary query
  const resStats = await db.query(`
    SELECT 
      COUNT(*) AS total_rows,
      COUNT(program) AS program_count,
      COUNT(cleaned_program) AS cleaned_program_count,
      COUNT(cleaned_class) AS cleaned_class_count,
      COUNT(link_weekly) AS link_weekly_count
    FROM link_report;
  `);

  console.log('\n=========================================');
  console.log('📊 DATABASE UPDATE SUMMARY:');
  console.log('Total rows in link_report:', resStats.rows[0].total_rows);
  console.log('Rows with program:', resStats.rows[0].program_count);
  console.log('Rows with cleaned_program:', resStats.rows[0].cleaned_program_count);
  console.log('Rows with cleaned_class:', resStats.rows[0].cleaned_class_count);
  console.log('Rows with link_weekly:', resStats.rows[0].link_weekly_count);
  console.log('=========================================\n');
}

processWeeklyLinks().catch(console.error).then(() => process.exit(0));
