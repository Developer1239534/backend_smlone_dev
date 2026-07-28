const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./src/db/neonClient');

async function main() {
  console.log('🚀 Starting import of Tritura Progress Videos & Trainee Logins...');

  const rawText = fs.readFileSync(path.join(__dirname, 'tritura_progress_raw.txt'), 'utf8');
  const lines = rawText.split(/\r?\n/);

  const items = new Map(); // id -> url

  let currentId = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Pattern 1: Tab or multi-space separated (e.g. "602  ▶️ Progress Video  https://...")
    const matchLine = line.match(/^([a-zA-Z0-9]+)\s+▶️\s*Progress\s*Video\s+(https?:\/\/[^\s]+)/i);
    if (matchLine) {
      items.set(matchLine[1].trim(), matchLine[2].trim());
      currentId = null;
      continue;
    }

    // Pattern 2: Standalone URL after standalone ID
    if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentId) {
        // extract URL if wrapped in markdown [url](url)
        let url = line;
        const mdMatch = line.match(/\]\((https?:\/\/[^\s)]+)\)/);
        if (mdMatch) {
          url = mdMatch[1];
        }
        items.set(currentId, url.trim());
        currentId = null;
      }
      continue;
    }

    // Pattern 3: Line is just an ID (numbers or alphanumeric like 70100102)
    if (/^[a-zA-Z0-9]+$/.test(line) && line !== 'ID' && line !== 'Report' && line !== 'Title' && line !== 'Link') {
      currentId = line;
      continue;
    }
  }

  console.log(`📊 Found ${items.size} unique trainee entries to import.`);

  let insertedPortal = 0;
  let updatedPortal = 0;
  let insertedLogin = 0;
  let updatedLogin = 0;

  const branchId = 'tritura';

  for (const [id, url] of items.entries()) {
    const plainPassword = `SML${id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert into portal_trainee
    const portalRes = await db.query(`
      INSERT INTO portal_trainee (trainee_id, branch_id, progress_video_url, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (trainee_id) DO UPDATE
      SET progress_video_url = EXCLUDED.progress_video_url,
          branch_id = EXCLUDED.branch_id,
          updated_at = NOW()
      RETURNING (xmax = 0) AS is_insert;
    `, [id, branchId, url]);

    if (portalRes.rows[0].is_insert) {
      insertedPortal++;
    } else {
      updatedPortal++;
    }

    // Upsert into login_trainee
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
  console.log(`✅ portal_trainee inserted: ${insertedPortal}, updated: ${updatedPortal}`);
  console.log(`✅ login_trainee inserted: ${insertedLogin}, updated: ${updatedLogin}`);

  const totalLogin = await db.query('SELECT COUNT(*) FROM login_trainee;');
  const totalPortal = await db.query('SELECT COUNT(*) FROM portal_trainee;');
  console.log(`📈 Current Total login_trainee count: ${totalLogin.rows[0].count}`);
  console.log(`📈 Current Total portal_trainee count: ${totalPortal.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
