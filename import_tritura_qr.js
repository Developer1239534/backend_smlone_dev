const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('./src/db/neonClient');

async function main() {
  const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript.jsonl';
  
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript file not found at:', transcriptPath);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(transcriptPath);
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

  console.log('Got user text of length:', lastUserText.length);

  // Now parse ID and URL pairs from lastUserText
  const lines = lastUserText.split(/\r?\n/);
  const items = new Map(); // id -> latest url

  let pendingId = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Pattern 1: ID \t Title \t URL or ID spaces Title spaces URL
    const matchTab = line.match(/^([a-zA-Z0-9]+)\s+.*?\s+(https?:\/\/[^\s]+)/);
    if (matchTab) {
      const id = matchTab[1].trim();
      const url = matchTab[2].trim();
      if (id !== 'ID' && id !== 'Report' && id !== 'Title') {
        items.set(id, url);
        pendingId = null;
        continue;
      }
    }

    // Pattern 2: Standalone URL after standalone ID
    if (line.startsWith('http://') || line.startsWith('https://')) {
      if (pendingId) {
        items.set(pendingId, line);
        pendingId = null;
      }
      continue;
    }

    // Pattern 3: Line is just an ID
    if (/^[a-zA-Z0-9]+$/.test(line) && line !== 'ID' && line !== 'Report' && line !== 'Title' && line !== 'Link') {
      pendingId = line;
      continue;
    }
  }

  console.log(`📊 Extracted ${items.size} unique trainee IDs for Quarterly Reports.`);

  let updatedPortal = 0;
  let insertedPortal = 0;
  let updatedLogin = 0;
  let insertedLogin = 0;

  const branchId = 'tritura';

  for (const [id, url] of items.entries()) {
    const plainPassword = `SML${id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert portal_trainee
    const portalRes = await db.query(`
      INSERT INTO portal_trainee (trainee_id, branch_id, quarterly_report_url, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (trainee_id) DO UPDATE
      SET quarterly_report_url = EXCLUDED.quarterly_report_url,
          branch_id = EXCLUDED.branch_id,
          updated_at = NOW()
      RETURNING (xmax = 0) AS is_insert;
    `, [id, branchId, url]);

    if (portalRes.rows[0].is_insert) {
      insertedPortal++;
    } else {
      updatedPortal++;
    }

    // Upsert login_trainee
    const loginRes = await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (student_id) DO UPDATE
      SET password = EXCLUDED.password,
          plain_password = EXCLUDED.plain_password,
          updated_at = NOW()
      RETURNING (xmax = 0) AS is_insert;
    `, [id, hashedPassword, plainPassword]);

    if (loginRes.rows[0].is_insert) {
      insertedLogin++;
    } else {
      updatedLogin++;
    }
  }

  console.log('--- Summary Results ---');
  console.log(`✅ portal_trainee - Inserted: ${insertedPortal}, Updated: ${updatedPortal}`);
  console.log(`✅ login_trainee  - Inserted: ${insertedLogin}, Updated: ${updatedLogin}`);

  const totalLogin = await db.query('SELECT COUNT(*) FROM login_trainee;');
  const totalPortal = await db.query('SELECT COUNT(*) FROM portal_trainee;');
  const totalQR = await db.query("SELECT COUNT(*) FROM portal_trainee WHERE quarterly_report_url IS NOT NULL;");
  console.log(`📈 Current Total login_trainee count: ${totalLogin.rows[0].count}`);
  console.log(`📈 Current Total portal_trainee count: ${totalPortal.rows[0].count}`);
  console.log(`📈 Total portal_trainee with quarterly_report_url: ${totalQR.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
