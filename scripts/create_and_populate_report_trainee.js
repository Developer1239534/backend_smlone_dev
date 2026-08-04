const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  const content = fs.readFileSync(path.join(__dirname, 'raw_report_data.txt'), 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

  // Find start index after header
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('link yt')) {
      startIdx = i + 1;
      break;
    }
  }

  const dataLines = lines.slice(startIdx);
  const records = [];

  let i = 0;
  while (i < dataLines.length) {
    const candidateId = dataLines[i];
    
    // Check if candidateId is a number or ID (digits)
    if (/^\d+$/.test(candidateId)) {
      const id = candidateId;
      let title = '';
      let link = '';

      if (i + 1 < dataLines.length) {
        title = dataLines[i + 1];
      }
      if (i + 2 < dataLines.length) {
        link = dataLines[i + 2];
      }

      // Clean markdown link format if present: [url](url) -> url
      let cleanLink = link;
      const match = link.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        cleanLink = match[2] || match[1];
      } else if (link.startsWith('http')) {
        cleanLink = link;
      }

      // If link is actually another ID (because link was missing for this entry)
      if (/^\d+$/.test(title)) {
        // title is actually the next ID!
        records.push({
          id,
          trainee_id: id,
          report_title: '▶️ Progress Video',
          link_yt: ''
        });
        i += 1;
        continue;
      } else if (/^\d+$/.test(link)) {
        // link is actually the next ID!
        records.push({
          id,
          trainee_id: id,
          report_title: title,
          link_yt: ''
        });
        i += 2;
        continue;
      } else {
        records.push({
          id,
          trainee_id: id,
          report_title: title || '▶️ Progress Video',
          link_yt: cleanLink
        });
        i += 3;
      }
    } else {
      i++;
    }
  }

  // Deduplicate records by ID (keep record with link_yt if available)
  const recordMap = new Map();
  for (const r of records) {
    if (!recordMap.has(r.id) || (r.link_yt && !recordMap.get(r.id).link_yt)) {
      recordMap.set(r.id, r);
    }
  }
  const uniqueRecords = Array.from(recordMap.values());
  console.log(`Deduplicated from ${records.length} to ${uniqueRecords.length} unique records.`);

  // Create table report_trainee if not exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS report_trainee (
      id VARCHAR(50) PRIMARY KEY,
      trainee_id VARCHAR(50) NOT NULL,
      report_title TEXT,
      link_yt TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Table report_trainee created or verified.');

  // Insert or update entries in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let b = 0; b < uniqueRecords.length; b += BATCH_SIZE) {
    const chunk = uniqueRecords.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];
    
    chunk.forEach((rec, idx) => {
      const base = idx * 4;
      valuePlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, NOW())`);
      params.push(rec.id, rec.trainee_id, rec.report_title, rec.link_yt);
    });

    const query = `
      INSERT INTO report_trainee (id, trainee_id, report_title, link_yt, updated_at)
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (id) 
      DO UPDATE SET 
        trainee_id = EXCLUDED.trainee_id,
        report_title = EXCLUDED.report_title,
        link_yt = EXCLUDED.link_yt,
        updated_at = NOW()
    `;

    await db.query(query, params);
    inserted += chunk.length;
    console.log(`Inserted batch ${Math.floor(b / BATCH_SIZE) + 1} (${inserted}/${uniqueRecords.length})`);
  }

  console.log(`Successfully inserted/updated ${inserted} rows in report_trainee table.`);

  // Verify count
  const res = await db.query('SELECT COUNT(*) FROM report_trainee');
  console.log(`Total rows in report_trainee: ${res.rows[0].count}`);

  process.exit(0);
}

main().catch(err => {
  console.error('Error in script:', err);
  process.exit(1);
});
