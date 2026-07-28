const fs = require('fs');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('./src/db/neonClient');

async function main() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';

  if (!fs.existsSync(fullTranscriptPath)) {
    console.error('Full transcript file not found at:', fullTranscriptPath);
    process.exit(1);
  }

  console.log('📖 Reading full transcript for Quarterly Report URLs...');

  const fileStream = fs.createReadStream(fullTranscriptPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lastUserText = '';

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        lastUserText = obj.content;
      }
    } catch (e) {}
  }

  console.log('📊 Got FULL user text length:', lastUserText.length);

  const lines = lastUserText.split(/\r?\n/);
  const qrMap = new Map();

  let currentId = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line is a valid ID
    if (/^[a-zA-Z0-9]+$/.test(line) &&
        line.toUpperCase() !== 'ID' &&
        !line.toLowerCase().includes('ini') &&
        !line.toLowerCase().includes('quarterly') &&
        !line.toLowerCase().includes('report') &&
        !line.toLowerCase().includes('title') &&
        !line.toLowerCase().includes('link')) {
      currentId = line;
    }

    // Check for docs.google.com link in line or markdown format [link](url)
    const match = line.match(/\((https?:\/\/[^\s\)]+)\)/) || line.match(/(https?:\/\/[^\s\)]+)/);
    if (match && currentId) {
      const url = match[1];
      qrMap.set(currentId, url);
      currentId = null;
    }
  }

  console.log(`🚀 Total UNIQUE trainee IDs with Quarterly Report URLs parsed: ${qrMap.size}`);

  let updatedPortal = 0;
  let updatedLogin = 0;

  for (const [id, qrUrl] of qrMap.entries()) {
    // Determine branch based on user rules
    let branch = 'cp';
    const num = parseInt(id, 10);
    if (id.startsWith('7')) {
      branch = 'tritura';
    } else if (id.startsWith('9') && id.length > 4) {
      branch = 'cemara';
    } else if (!isNaN(num) && num >= 1 && num <= 1000) {
      branch = 'cp';
    } else if (id.startsWith('9')) {
      branch = 'cemara';
    }

    const plainPassword = `SML${id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert portal_trainee with quarterly_report_url
    await db.query(`
      INSERT INTO portal_trainee (trainee_id, branch_id, quarterly_report_url, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (trainee_id) DO UPDATE
      SET quarterly_report_url = EXCLUDED.quarterly_report_url,
          branch_id = COALESCE(portal_trainee.branch_id, EXCLUDED.branch_id),
          updated_at = NOW();
    `, [id, branch, qrUrl]);
    updatedPortal++;

    // Upsert login_trainee
    await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (student_id) DO UPDATE
      SET password = EXCLUDED.password,
          plain_password = EXCLUDED.plain_password,
          updated_at = NOW();
    `, [id, hashedPassword, plainPassword]);
    updatedLogin++;
  }

  console.log('--- Summary Results ---');
  console.log(`✅ portal_trainee updated with quarterly_report_url: ${updatedPortal}`);
  console.log(`✅ login_trainee synced:                              ${updatedLogin}`);

  const sample = await db.query("SELECT trainee_id, branch_id, quarterly_report_url FROM portal_trainee WHERE quarterly_report_url IS NOT NULL LIMIT 5;");
  console.log('--- Sample Records in Database ---');
  console.table(sample.rows);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
