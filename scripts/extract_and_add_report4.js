const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🚀 Extracting report_title_4 and referral_code data...');

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

  const idx = lastUserMsg.indexOf('ID');
  const targetText = idx !== -1 ? lastUserMsg.slice(idx) : lastUserMsg;
  const rawLines = targetText.split('\n').map(l => l.trim()).filter(l => l !== '');

  const recordsMap = new Map(); // id -> { title4: 'REFERRAL CODE', code: '...' }

  for (const line of rawLines) {
    if (line.startsWith('ID') || line.includes('Report Title') || line.includes('USER_REQUEST')) continue;
    
    // Check tab separated: ID\tREFERRAL CODE\tCODE
    const parts = line.split(/\t+/);
    if (parts.length >= 3 && /^\d+$/.test(parts[0])) {
      const id = parts[0];
      const title4 = parts[1];
      const code = parts[2];
      recordsMap.set(id, { title4, code });
    } else {
      // Check space separated: ID REFERRAL CODE CODE
      const spaceParts = line.split(/\s+/);
      if (spaceParts.length >= 3 && /^\d+$/.test(spaceParts[0])) {
        const id = spaceParts[0];
        const code = spaceParts[spaceParts.length - 1];
        const title4 = spaceParts.slice(1, spaceParts.length - 1).join(' ');
        recordsMap.set(id, { title4, code });
      }
    }
  }

  console.log(`Parsed report4 / referral records for ${recordsMap.size} unique Trainee IDs.`);

  // 1. Alter table report_trainee to add report_title_4, link_to_report_4, referral_code
  await db.query(`
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_4 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report_4 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS referral_code TEXT;
  `);

  console.log('Added report_title_4, link_to_report_4, referral_code columns to report_trainee.');

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
  for (const [id, obj] of recordsMap.entries()) {
    updateRows.push({
      id,
      report_title_4: obj.title4 || 'REFERRAL CODE',
      link_to_report_4: obj.code || '',
      referral_code: obj.code || ''
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
      params.push(rec.id, rec.id, rec.report_title_4, rec.link_to_report_4, rec.referral_code);
    });

    const sql = `
      INSERT INTO report_trainee (id, trainee_id, report_title_4, link_to_report_4, referral_code, created_at, updated_at)
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (id)
      DO UPDATE SET
        report_title_4 = EXCLUDED.report_title_4,
        link_to_report_4 = EXCLUDED.link_to_report_4,
        referral_code = EXCLUDED.referral_code,
        updated_at = NOW()
    `;

    await queryWithRetry(sql, params);
    updatedCount += chunk.length;
    console.log(`Updated batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(updateRows.length / BATCH_SIZE)} (${updatedCount}/${updateRows.length})`);
  }

  console.log('🎉 Successfully updated report_trainee with report_title_4 & referral_code!');
  
  const sample = await db.query('SELECT id, report_title, report_title_3, report_title_4, link_to_report_4, referral_code FROM report_trainee WHERE report_title_4 IS NOT NULL LIMIT 5');
  console.log('Sample rows:', sample.rows);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error in extract_and_add_report4 script:', err);
  process.exit(1);
});
