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

async function populate() {
  try {
    const { p1Records, p2Records } = parseData();

    console.log(`Parsed P1 Records: ${p1Records.length}`);
    console.log(`Parsed P2 Records: ${p2Records.length}`);

    // Clean restart
    await db.query('TRUNCATE TABLE link_report');
    console.log('Cleared link_report table.');

    // Insert P1 records
    let p1Inserted = 0;
    for (const r of p1Records) {
      await db.query(`
        INSERT INTO link_report (trainee_id, term, link_term)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, term)
        DO UPDATE SET link_term = EXCLUDED.link_term;
      `, [r.trainee_id, r.term, r.link_term]);
      p1Inserted++;
    }
    console.log(`Inserted/Updated ${p1Inserted} records from P1.`);

    // Insert/Update P2 records
    let p2Inserted = 0;
    const defaultTerm = 'May 2026 - Jun 2026';
    for (const r of p2Records) {
      await db.query(`
        INSERT INTO link_report (trainee_id, term, link_youtube)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, term)
        DO UPDATE SET link_youtube = EXCLUDED.link_youtube;
      `, [r.trainee_id, defaultTerm, r.link_youtube]);
      p2Inserted++;
    }
    console.log(`Inserted/Updated ${p2Inserted} records from P2.`);

    // Check stats
    const totalRes = await db.query('SELECT COUNT(*) FROM link_report');
    const withDriveRes = await db.query('SELECT COUNT(*) FROM link_report WHERE link_term IS NOT NULL');
    const withYtRes = await db.query('SELECT COUNT(*) FROM link_report WHERE link_youtube IS NOT NULL');
    const withBothRes = await db.query('SELECT COUNT(*) FROM link_report WHERE link_term IS NOT NULL AND link_youtube IS NOT NULL');

    console.log('\n--- SUMMARY RESULTS ---');
    console.log(`Total Rows in link_report: ${totalRes.rows[0].count}`);
    console.log(`Rows with Drive link (link_term): ${withDriveRes.rows[0].count}`);
    console.log(`Rows with YouTube link (link_youtube): ${withYtRes.rows[0].count}`);
    console.log(`Rows with BOTH links: ${withBothRes.rows[0].count}`);

    // Sample
    const sample = await db.query('SELECT * FROM link_report LIMIT 5');
    console.log('\nSample rows:', sample.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error populating database:', err);
    process.exit(1);
  }
}

populate();
