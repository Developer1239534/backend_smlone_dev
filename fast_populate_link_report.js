const fs = require('fs');
const db = require('./src/db/neonClient');

function cleanUrl(str) {
  if (!str) return null;
  const match = str.match(/\((https?:\/\/[^\)]+)\)/);
  if (match) return match[1];
  const plainMatch = str.match(/https?:\/\/[^\s\]]+/);
  if (plainMatch) return plainMatch[0];
  return str.trim();
}

function parseData() {
  const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

  const parts = raw.split(/ini juga ya letakkan di tabel link_report/i);
  const part1 = parts[0];
  const part2 = parts[1] || '';

  // Parse P1
  const p1Lines = part1.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const p1DataLines = p1Lines.filter(l => 
    !l.startsWith('<USER_REQUEST>') && 
    !l.startsWith('</USER_REQUEST>') && 
    !l.startsWith('lalu ini letakkan') && 
    l !== 'Term' && 
    l !== 'Link Term'
  );

  const p1Records = [];
  let i = 0;
  while (i < p1DataLines.length) {
    const trainee_id = p1DataLines[i];
    const term = p1DataLines[i+1];
    const link_term_raw = p1DataLines[i+2];

    if (trainee_id && term && link_term_raw && (link_term_raw.includes('drive.google.com') || link_term_raw.includes('http'))) {
      p1Records.push({
        trainee_id,
        term,
        link_term: cleanUrl(link_term_raw)
      });
      i += 3;
    } else {
      i++;
    }
  }

  // Parse P2
  const p2Lines = part2.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const p2DataLines = p2Lines.filter(l => 
    !l.startsWith('Trainee_id') && 
    !l.startsWith('Nama') && 
    !l.startsWith('Link YT') &&
    !l.startsWith('</USER_REQUEST>') &&
    !l.startsWith('<truncated') &&
    !l.startsWith('NOTE:')
  );

  const p2Records = [];
  let j = 0;
  while (j < p2DataLines.length) {
    const line1 = p2DataLines[j];
    const line2 = p2DataLines[j+1];
    const line3 = p2DataLines[j+2];

    if (line3 && (line3.includes('youtube.com') || line3.includes('youtu.be') || line3.includes('http'))) {
      p2Records.push({
        trainee_id: line1,
        nama: line2,
        link_youtube: cleanUrl(line3)
      });
      j += 3;
    } else if (line2 && (line2.includes('youtube.com') || line2.includes('youtu.be') || line2.includes('http'))) {
      p2Records.push({
        trainee_id: line1,
        nama: '',
        link_youtube: cleanUrl(line2)
      });
      j += 2;
    } else if (line1 && /^\d+$/.test(line1) && line2 && !line2.includes('http')) {
      p2Records.push({
        trainee_id: line1,
        nama: line2,
        link_youtube: null
      });
      j += 2;
    } else {
      j++;
    }
  }

  return { p1Records, p2Records };
}

async function fastPopulate() {
  try {
    const { p1Records, p2Records } = parseData();

    // Map by key: `${trainee_id}_${term}`
    const map = new Map();
    const defaultTerm = 'May 2026 - Jun 2026';

    p1Records.forEach(r => {
      const key = `${r.trainee_id}___${r.term}`;
      map.set(key, {
        trainee_id: r.trainee_id,
        term: r.term,
        link_term: r.link_term,
        link_youtube: null
      });
    });

    p2Records.forEach(r => {
      const key = `${r.trainee_id}___${defaultTerm}`;
      if (map.has(key)) {
        map.get(key).link_youtube = r.link_youtube;
      } else {
        map.set(key, {
          trainee_id: r.trainee_id,
          term: defaultTerm,
          link_term: null,
          link_youtube: r.link_youtube
        });
      }
    });

    const mergedRows = Array.from(map.values());
    console.log(`Total merged unique rows to insert: ${mergedRows.length}`);

    await db.query('TRUNCATE TABLE link_report');
    console.log('Truncated link_report.');

    // Perform batch insert (chunks of 100 rows)
    const chunkSize = 100;
    for (let c = 0; c < mergedRows.length; c += chunkSize) {
      const chunk = mergedRows.slice(c, c + chunkSize);
      const valueStrings = [];
      const queryParams = [];
      let paramIdx = 1;

      chunk.forEach(row => {
        valueStrings.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3})`);
        queryParams.push(row.trainee_id, row.term, row.link_term, row.link_youtube);
        paramIdx += 4;
      });

      const batchQuery = `
        INSERT INTO link_report (trainee_id, term, link_term, link_youtube)
        VALUES ${valueStrings.join(', ')}
        ON CONFLICT (trainee_id, term) DO UPDATE SET
          link_term = COALESCE(EXCLUDED.link_term, link_report.link_term),
          link_youtube = COALESCE(EXCLUDED.link_youtube, link_report.link_youtube);
      `;

      await db.query(batchQuery, queryParams);
      console.log(`Inserted chunk ${c / chunkSize + 1} (${chunk.length} rows)`);
    }

    // Verify
    const countRes = await db.query('SELECT COUNT(*) FROM link_report');
    const withDriveRes = await db.query('SELECT COUNT(*) FROM link_report WHERE link_term IS NOT NULL');
    const withYtRes = await db.query('SELECT COUNT(*) FROM link_report WHERE link_youtube IS NOT NULL');
    const withBothRes = await db.query('SELECT COUNT(*) FROM link_report WHERE link_term IS NOT NULL AND link_youtube IS NOT NULL');

    console.log('\n=========================================');
    console.log(`🎉 SUCCESS! Population complete.`);
    console.log(`📊 Total rows in link_report: ${countRes.rows[0].count}`);
    console.log(`📁 Rows with Google Drive link: ${withDriveRes.rows[0].count}`);
    console.log(`▶️  Rows with YouTube link: ${withYtRes.rows[0].count}`);
    console.log(`🔗 Rows with BOTH links: ${withBothRes.rows[0].count}`);
    console.log('=========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Error in fast populate:', err);
    process.exit(1);
  }
}

fastPopulate();
