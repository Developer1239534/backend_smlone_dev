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

  console.log('📖 Reading full transcript for Cemara branch IDs...');

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
  const cemaraIds = new Set();

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (/^[a-zA-Z0-9]+$/.test(line) && line !== 'ID' && line.toLowerCase() !== 'ini' && line.toLowerCase() !== 'adalah' && line.toLowerCase() !== 'untuk' && line.toLowerCase() !== 'di' && line.toLowerCase() !== 'cabang' && line.toLowerCase() !== 'cemara' && line.toLowerCase() !== 'ya' && line.toLowerCase() !== 'yaa' && line.toLowerCase() !== 'letakkan' && line.toLowerCase() !== 'dan' && line.toLowerCase() !== 'isi' && line.toLowerCase() !== 'coloumn' && line.toLowerCase() !== 'dengan') {
      cemaraIds.add(line);
    }
  }

  console.log(`🚀 Total UNIQUE trainee IDs parsed for Cemara branch: ${cemaraIds.size}`);

  let insertedPortal = 0;
  let updatedPortal = 0;
  let insertedLogin = 0;
  let updatedLogin = 0;

  const branchId = 'cemara';

  for (const id of cemaraIds) {
    const plainPassword = `SML${id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert/Upsert portal_trainee
    const portalRes = await db.query(`
      INSERT INTO portal_trainee (trainee_id, branch_id, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (trainee_id) DO UPDATE
      SET branch_id = EXCLUDED.branch_id,
          updated_at = NOW()
      RETURNING (xmax = 0) AS is_insert;
    `, [id, branchId]);

    if (portalRes.rows[0].is_insert) {
      insertedPortal++;
    } else {
      updatedPortal++;
    }

    // Insert/Upsert login_trainee
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
  const totalCemara = await db.query("SELECT COUNT(*) FROM portal_trainee WHERE branch_id = 'cemara';");

  console.log(`📈 Current Total login_trainee count: ${totalLogin.rows[0].count}`);
  console.log(`📈 Current Total portal_trainee count: ${totalPortal.rows[0].count}`);
  console.log(`📈 Total portal_trainee branch 'cemara': ${totalCemara.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
