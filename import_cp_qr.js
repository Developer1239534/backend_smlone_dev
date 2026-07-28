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

  console.log('📖 Reading full transcript for CP Quarterly Report import...');

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
  const items = new Map(); // id -> latest google docs url

  let pendingId = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Pattern 1: Same line "96  Jan - Mar 2023  https://docs.google.com/..."
    const matchSameLine = line.match(/^([a-zA-Z0-9]+)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\s]*\s+(https?:\/\/[^\s]+)/i);
    if (matchSameLine) {
      const id = matchSameLine[1].trim();
      let url = matchSameLine[2].trim();
      const mdMatch = url.match(/\]\((https?:\/\/[^\s)]+)\)/);
      if (mdMatch) url = mdMatch[1];
      if (id !== 'ID' && id !== 'Report' && id !== 'Title' && id.toLowerCase() !== 'yang') {
        items.set(id, url);
        pendingId = null;
        continue;
      }
    }

    // Pattern 2: Standalone URL line (markdown link or raw link)
    if (line.startsWith('http://') || line.startsWith('https://') || line.includes('docs.google.com')) {
      let url = line;
      const mdMatch = line.match(/\]\((https?:\/\/[^\s)]+)\)/);
      if (mdMatch) url = mdMatch[1];

      if (pendingId && pendingId !== 'ID' && pendingId !== 'Report' && pendingId !== 'Title' && pendingId !== 'Link' && pendingId.toLowerCase() !== 'yang') {
        items.set(pendingId, url.trim());
        pendingId = null;
      }
      continue;
    }

    // Pattern 3: Standalone ID line (alphanumeric, avoiding headers/quarter names)
    if (/^[a-zA-Z0-9]+$/.test(line) && line !== 'ID' && line !== 'Report' && line !== 'Title' && line !== 'Link' && line.toLowerCase() !== 'yang' && !/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line)) {
      pendingId = line;
      continue;
    }
  }

  console.log(`🚀 Total UNIQUE trainee IDs parsed for CP Quarterly Report: ${items.size}`);

  let insertedPortal = 0;
  let updatedPortal = 0;
  let insertedLogin = 0;
  let updatedLogin = 0;

  const branchId = 'cp';

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
  const totalCP = await db.query("SELECT COUNT(*) FROM portal_trainee WHERE branch_id = 'cp';");
  const totalCPQR = await db.query("SELECT COUNT(*) FROM portal_trainee WHERE branch_id = 'cp' AND quarterly_report_url IS NOT NULL;");

  console.log(`📈 Current Total login_trainee count: ${totalLogin.rows[0].count}`);
  console.log(`📈 Current Total portal_trainee count: ${totalPortal.rows[0].count}`);
  console.log(`📈 Total portal_trainee branch 'cp': ${totalCP.rows[0].count}`);
  console.log(`📈 Total portal_trainee 'cp' with quarterly_report_url: ${totalCPQR.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
