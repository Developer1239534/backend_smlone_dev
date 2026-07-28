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

  console.log('📖 Reading full transcript for CP Progress Video import...');

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
  const progressVideos = new Map(); // id -> video_url
  const referralCodes = new Map(); // id -> ref_code

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Pattern 1: "602  ▶️ Progress Video  https://www.youtube.com/playlist..."
    const matchPV = line.match(/^([a-zA-Z0-9]+)\s+▶️?\s*Progress\s+Video\s+(https?:\/\/[^\s]+)/i);
    if (matchPV) {
      const id = matchPV[1].trim();
      let url = matchPV[2].trim();
      const mdMatch = url.match(/\]\((https?:\/\/[^\s)]+)\)/);
      if (mdMatch) url = mdMatch[1];
      if (id !== 'ID' && id.toLowerCase() !== 'yang') {
        progressVideos.set(id, url);
      }
      continue;
    }

    // Pattern 2: "1198 REFERRAL CODE 1198JOVAN"
    const matchRef = line.match(/^([a-zA-Z0-9]+)\s+REFERRAL\s+CODE\s+([a-zA-Z0-9]+)/i);
    if (matchRef) {
      const id = matchRef[1].trim();
      const code = matchRef[2].trim();
      if (id !== 'ID' && id.toLowerCase() !== 'yang') {
        referralCodes.set(id, code);
      }
      continue;
    }
  }

  console.log(`🚀 Total UNIQUE trainee IDs parsed for CP Progress Video: ${progressVideos.size}`);
  console.log(`🚀 Total UNIQUE trainee IDs parsed for CP Referral Code: ${referralCodes.size}`);

  // Combine all IDs
  const allIds = new Set([...progressVideos.keys(), ...referralCodes.keys()]);
  console.log(`🚀 Total UNIQUE combined IDs for Branch CP: ${allIds.size}`);

  let insertedPortal = 0;
  let updatedPortal = 0;
  let insertedLogin = 0;
  let updatedLogin = 0;

  const branchId = 'cp';

  for (const id of allIds) {
    const videoUrl = progressVideos.get(id) || null;
    const refCode = referralCodes.get(id) || null;

    const plainPassword = `SML${id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert portal_trainee
    const portalRes = await db.query(`
      INSERT INTO portal_trainee (trainee_id, branch_id, progress_video_url, referral_code, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (trainee_id) DO UPDATE
      SET branch_id = EXCLUDED.branch_id,
          progress_video_url = COALESCE(EXCLUDED.progress_video_url, portal_trainee.progress_video_url),
          referral_code = COALESCE(EXCLUDED.referral_code, portal_trainee.referral_code),
          updated_at = NOW()
      RETURNING (xmax = 0) AS is_insert;
    `, [id, branchId, videoUrl, refCode]);

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
  const totalCPPV = await db.query("SELECT COUNT(*) FROM portal_trainee WHERE branch_id = 'cp' AND progress_video_url IS NOT NULL;");

  console.log(`📈 Current Total login_trainee count: ${totalLogin.rows[0].count}`);
  console.log(`📈 Current Total portal_trainee count: ${totalPortal.rows[0].count}`);
  console.log(`📈 Total portal_trainee branch 'cp': ${totalCP.rows[0].count}`);
  console.log(`📈 Total portal_trainee 'cp' with progress_video_url: ${totalCPPV.rows[0].count}`);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
