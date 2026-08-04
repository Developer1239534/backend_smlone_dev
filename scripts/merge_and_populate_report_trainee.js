const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🚀 Merging Youtube links & Term links into report_trainee table...');

  // 1. Read YouTube records
  const ytContent = fs.readFileSync(path.join(__dirname, 'raw_report_data.txt'), 'utf8');
  const ytLines = ytContent.split('\n').map(l => l.trim()).filter(l => l !== '');
  let ytStartIdx = 0;
  for (let i = 0; i < ytLines.length; i++) {
    if (ytLines[i].toLowerCase().includes('link yt')) {
      ytStartIdx = i + 1;
      break;
    }
  }
  const ytDataLines = ytLines.slice(ytStartIdx);
  const ytRecords = new Map();

  let i = 0;
  while (i < ytDataLines.length) {
    const candidateId = ytDataLines[i];
    if (/^\d+$/.test(candidateId)) {
      const id = candidateId;
      let title = ytDataLines[i + 1] || '';
      let link = ytDataLines[i + 2] || '';

      let cleanLink = link;
      const match = link.match(/\[(.*?)\]\((.*?)\)/);
      if (match) cleanLink = match[2] || match[1];
      else if (link.startsWith('http')) cleanLink = link;

      if (/^\d+$/.test(title)) {
        ytRecords.set(id, { id, report_title: '▶️ Progress Video', link_yt: '' });
        i += 1;
      } else if (/^\d+$/.test(link)) {
        ytRecords.set(id, { id, report_title: title, link_yt: '' });
        i += 2;
      } else {
        ytRecords.set(id, { id, report_title: title || '▶️ Progress Video', link_yt: cleanLink });
        i += 3;
      }
    } else {
      i++;
    }
  }

  console.log(`Parsed ${ytRecords.size} YouTube records.`);

  // 2. Read Term records
  const termContent = fs.readFileSync(path.join(__dirname, 'raw_term_data.txt'), 'utf8');
  const termLines = termContent.split('\n').map(l => l.trim()).filter(l => l !== '');
  let termStartIdx = 0;
  for (let j = 0; j < termLines.length; j++) {
    if (termLines[j].toLowerCase().includes('link term')) {
      termStartIdx = j + 1;
      break;
    }
  }
  const termDataLines = termLines.slice(termStartIdx);
  const termRecordsMap = new Map();

  let k = 0;
  while (k < termDataLines.length) {
    const candidateId = termDataLines[k];
    if (/^\d+$/.test(candidateId)) {
      const id = candidateId;
      let title2 = termDataLines[k + 1] || '';
      let linkTerm = termDataLines[k + 2] || '';

      let cleanLink = linkTerm;
      const match = linkTerm.match(/\[(.*?)\]\((.*?)\)/);
      if (match) cleanLink = match[2] || match[1];
      else if (linkTerm.startsWith('http')) cleanLink = linkTerm;

      if (/^\d+$/.test(title2)) {
        k += 1;
      } else if (/^\d+$/.test(linkTerm)) {
        if (!termRecordsMap.has(id)) termRecordsMap.set(id, []);
        termRecordsMap.get(id).push({ term: title2, link: '' });
        k += 2;
      } else {
        if (!termRecordsMap.has(id)) termRecordsMap.set(id, []);
        termRecordsMap.get(id).push({ term: title2, link: cleanLink });
        k += 3;
      }
    } else {
      k++;
    }
  }

  console.log(`Parsed term records for ${termRecordsMap.size} unique IDs.`);

  // 3. Create or update report_trainee table schema
  await db.query(`
    CREATE TABLE IF NOT EXISTS report_trainee (
      id VARCHAR(50) PRIMARY KEY,
      trainee_id VARCHAR(50) NOT NULL,
      report_title TEXT,
      link_yt TEXT,
      report_title_2 TEXT,
      link_term TEXT,
      link_terms JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_2 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_term TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_terms JSONB;
  `);

  console.log('Table report_trainee structure verified.');

  // 4. Combine all IDs (both from YT and Term lists)
  const allIds = new Set([...ytRecords.keys(), ...termRecordsMap.keys()]);
  console.log(`Total combined unique IDs: ${allIds.size}`);

  const combinedRows = [];
  for (const id of allIds) {
    const ytObj = ytRecords.get(id) || { report_title: '▶️ Progress Video', link_yt: '' };
    const termsArr = termRecordsMap.get(id) || [];
    
    // Pick latest non-empty term
    let latestTermTitle = '';
    let latestTermLink = '';
    for (let t = termsArr.length - 1; t >= 0; t--) {
      if (termsArr[t].link) {
        latestTermTitle = termsArr[t].term;
        latestTermLink = termsArr[t].link;
        break;
      }
    }
    if (!latestTermTitle && termsArr.length > 0) {
      latestTermTitle = termsArr[termsArr.length - 1].term;
      latestTermLink = termsArr[termsArr.length - 1].link;
    }

    combinedRows.push({
      id,
      trainee_id: id,
      report_title: ytObj.report_title || '▶️ Progress Video',
      link_yt: ytObj.link_yt || '',
      report_title_2: latestTermTitle || '',
      link_term: latestTermLink || '',
      link_terms: JSON.stringify(termsArr)
    });
  }

  async function queryWithRetry(sql, params, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await db.query(sql, params);
      } catch (err) {
        console.warn(`[Attempt ${attempt}/${retries}] Query failed: ${err.message}. Retrying in 2s...`);
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  // 5. Batch insert into report_trainee
  const BATCH_SIZE = 25;
  let inserted = 0;

  for (let b = 0; b < combinedRows.length; b += BATCH_SIZE) {
    const chunk = combinedRows.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];

    chunk.forEach((rec, idx) => {
      const base = idx * 7;
      valuePlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, NOW())`);
      params.push(rec.id, rec.trainee_id, rec.report_title, rec.link_yt, rec.report_title_2, rec.link_term, rec.link_terms);
    });

    const query = `
      INSERT INTO report_trainee (id, trainee_id, report_title, link_yt, report_title_2, link_term, link_terms, updated_at)
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (id)
      DO UPDATE SET
        trainee_id = EXCLUDED.trainee_id,
        report_title = EXCLUDED.report_title,
        link_yt = EXCLUDED.link_yt,
        report_title_2 = EXCLUDED.report_title_2,
        link_term = EXCLUDED.link_term,
        link_terms = EXCLUDED.link_terms,
        updated_at = NOW()
    `;

    await queryWithRetry(query, params);
    inserted += chunk.length;
    console.log(`Inserted batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(combinedRows.length / BATCH_SIZE)} (${inserted}/${combinedRows.length})`);
  }

  console.log('✅ Successfully updated report_trainee table.');

  // 6. Drop the old uppercase table "Report_Trainee" if it exists
  console.log('🗑️ Dropping old uppercase table "Report_Trainee" if present...');
  try {
    await db.query('DROP TABLE IF EXISTS "Report_Trainee" CASCADE');
    console.log('✅ Old table "Report_Trainee" processed/dropped.');
  } catch (err) {
    console.log('ℹ️ Old table "Report_Trainee" already gone or non-existent:', err.message);
  }

  // 7. Verify count in report_trainee
  const countRes = await queryWithRetry('SELECT COUNT(*) FROM report_trainee');
  console.log(`🎉 Total rows in report_trainee table: ${countRes.rows[0].count}`);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error in merge script:', err);
  process.exit(1);
});
