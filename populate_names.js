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

async function populateNames() {
  try {
    const { p1Records, p2Records } = parseData();

    // Build a map of trainee_id -> nama from P2
    const nameMap = new Map();
    p2Records.forEach(r => {
      if (r.nama && r.nama.trim().length > 0) {
        nameMap.set(r.trainee_id, r.nama.trim());
      }
    });

    console.log(`Names collected directly from prompt Part 2: ${nameMap.size}`);

    // Update link_report with names from P2
    for (const [trainee_id, nama] of nameMap.entries()) {
      await db.query(`
        UPDATE link_report
        SET nama = $1
        WHERE trainee_id = $2 AND (nama IS NULL OR nama = '');
      `, [nama, trainee_id]);
    }

    // Try to lookup missing names from portal_admin and other tables
    const missingRes = await db.query(`
      SELECT DISTINCT trainee_id FROM link_report WHERE nama IS NULL OR nama = '';
    `);
    console.log(`Trainee IDs still missing name: ${missingRes.rows.length}`);

    // Lookup from portal_admin
    const portalAdminRes = await db.query(`
      SELECT trainee_id, name FROM portal_admin WHERE name IS NOT NULL AND name != '';
    `);
    let updatedFromPortal = 0;
    for (const row of portalAdminRes.rows) {
      if (row.trainee_id && row.name) {
        const update = await db.query(`
          UPDATE link_report SET nama = $1 WHERE trainee_id = $2 AND (nama IS NULL OR nama = '');
        `, [row.name, row.trainee_id]);
        if (update.rowCount > 0) updatedFromPortal += update.rowCount;
      }
    }
    console.log(`Updated ${updatedFromPortal} names from portal_admin table.`);

    // Final check
    const totalCount = await db.query('SELECT COUNT(*) FROM link_report');
    const withNameCount = await db.query("SELECT COUNT(*) FROM link_report WHERE nama IS NOT NULL AND nama != ''");
    const sample = await db.query('SELECT trainee_id, nama, term, link_term, link_youtube FROM link_report ORDER BY nama ASC NULLS LAST LIMIT 10');

    console.log('\n=========================================');
    console.log(`📊 Total rows in link_report: ${totalCount.rows[0].count}`);
    console.log(`👤 Rows with Name (nama): ${withNameCount.rows[0].count}`);
    console.log('=========================================\n');
    console.log('Sample rows:', sample.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error populating names:', err);
    process.exit(1);
  }
}

populateNames();
