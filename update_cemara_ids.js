const fs = require('fs');
const readline = require('readline');
const db = require('./src/db/neonClient');

async function main() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';

  if (!fs.existsSync(fullTranscriptPath)) {
    console.error('Full transcript file not found at:', fullTranscriptPath);
    process.exit(1);
  }

  console.log('📖 Reading full transcript for latest Cemara IDs user prompt...');

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

    if (/^[a-zA-Z0-9]+$/.test(line) && line !== 'ID' && line.toLowerCase() !== 'ini' && line.toLowerCase() !== 'untuk' && line.toLowerCase() !== 'cemara' && line.toLowerCase() !== 'ya') {
      cemaraIds.add(line);
    }
  }

  console.log(`🚀 Total UNIQUE trainee IDs parsed for Cemara: ${cemaraIds.size}`);

  const cemaraArr = Array.from(cemaraIds);

  // 1. Update Cemara IDs in portal_trainee
  const updateRes = await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'cemara', updated_at = NOW()
    WHERE trainee_id = ANY($1::text[])
    RETURNING trainee_id;
  `, [cemaraArr]);

  console.log(`✅ Updated ${updateRes.rowCount} trainees to branch_id = 'cemara'`);

  // Inspect current branch distribution after update
  const branchAfter = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id ORDER BY COUNT(*) DESC;');
  console.log('--- Branch Distribution AFTER Cemara Update ---');
  console.table(branchAfter.rows);
}

main().catch(err => {
  console.error('❌ Update error:', err);
  process.exit(1);
});
