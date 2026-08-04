const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🚀 Extracting report_title_3 and link_to_report data...');

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

  const idx = lastUserMsg.indexOf('Report Title');
  const targetText = idx !== -1 ? lastUserMsg.slice(idx) : lastUserMsg;

  const dataLines = targetText.split('\n').map(l => l.trim()).filter(l => l !== '');
  
  let startIdx = 0;
  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i].toLowerCase().includes('link to report')) {
      startIdx = i + 1;
      break;
    }
  }

  const records = [];
  const recordsMap = new Map(); // id -> [{ title3, linkReport }]

  let i = startIdx;
  const list = dataLines.slice(startIdx);

  let p = 0;
  while (p < list.length) {
    const candidateId = list[p];
    if (/^\d+$/.test(candidateId)) {
      const id = candidateId;
      let title3 = list[p + 1] || '';
      let linkRep = list[p + 2] || '';

      let cleanLink = linkRep;
      const match = linkRep.match(/\[(.*?)\]\((.*?)\)/);
      if (match) cleanLink = match[2] || match[1];
      else if (linkRep.startsWith('http')) cleanLink = linkRep;

      if (/^\d+$/.test(title3)) {
        p += 1;
      } else if (/^\d+$/.test(linkRep)) {
        if (!recordsMap.has(id)) recordsMap.set(id, []);
        recordsMap.get(id).push({ title3, linkReport: '' });
        p += 2;
      } else {
        if (!recordsMap.has(id)) recordsMap.set(id, []);
        recordsMap.get(id).push({ title3, linkReport: cleanLink });
        p += 3;
      }
    } else {
      p++;
    }
  }

  console.log(`Parsed report3 records for ${recordsMap.size} unique Trainee IDs.`);

  // 1. Alter table report_trainee to add report_title_3, link_to_report, link_reports_3
  await db.query(`
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_3 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_reports_3 JSONB;
  `);

  console.log('Added report_title_3, link_to_report, link_reports_3 columns to report_trainee.');

  // Helper retry
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

  // 2. Prepare update rows
  const updateRows = [];
  for (const [id, arr] of recordsMap.entries()) {
    // latest non-empty link
    let latestTitle = '';
    let latestLink = '';
    for (let t = arr.length - 1; t >= 0; t--) {
      if (arr[t].linkReport) {
        latestTitle = arr[t].title3;
        latestLink = arr[t].linkReport;
        break;
      }
    }
    if (!latestTitle && arr.length > 0) {
      latestTitle = arr[arr.length - 1].title3;
      latestLink = arr[arr.length - 1].linkReport;
    }

    updateRows.push({
      id,
      report_title_3: latestTitle,
      link_to_report: latestLink,
      link_reports_3: JSON.stringify(arr)
    });
  }

  // Batch update / upsert into report_trainee
  const BATCH_SIZE = 25;
  let updatedCount = 0;

  for (let b = 0; b < updateRows.length; b += BATCH_SIZE) {
    const chunk = updateRows.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];

    chunk.forEach((rec, idx) => {
      const base = idx * 5;
      valuePlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, NOW(), NOW())`);
      params.push(rec.id, rec.id, rec.report_title_3, rec.link_to_report, rec.link_reports_3);
    });

    const sql = `
      INSERT INTO report_trainee (id, trainee_id, report_title_3, link_to_report, link_reports_3, created_at, updated_at)
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (id)
      DO UPDATE SET
        report_title_3 = EXCLUDED.report_title_3,
        link_to_report = EXCLUDED.link_to_report,
        link_reports_3 = EXCLUDED.link_reports_3,
        updated_at = NOW()
    `;

    await queryWithRetry(sql, params);
    updatedCount += chunk.length;
    console.log(`Updated batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(updateRows.length / BATCH_SIZE)} (${updatedCount}/${updateRows.length})`);
  }

  console.log('🎉 Successfully updated report_trainee with report_title_3 & link_to_report!');
  
  const sample = await db.query('SELECT id, report_title, report_title_2, report_title_3, link_to_report FROM report_trainee WHERE report_title_3 IS NOT NULL LIMIT 5');
  console.log('Sample rows:', sample.rows);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error in extract_and_add_report3 script:', err);
  process.exit(1);
});
