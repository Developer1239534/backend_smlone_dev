const fs = require('fs');
const readline = require('readline');
const db = require('./src/db/neonClient');

async function main() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';

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

  // Parse the EXACT Tritura IDs from the user's latest prompt
  const trituraIds = new Set();
  const lines = lastUserText.split(/\r?\n/);
  for (let l of lines) {
    l = l.trim();
    if (!l) continue;
    if (/^[a-zA-Z0-9]+$/.test(l) && l !== 'ID' && l.toLowerCase() !== 'yang' && l.toLowerCase() !== 'kenapa') {
      trituraIds.add(l);
    }
  }

  console.log(`🎯 Parsed EXACT Tritura IDs count: ${trituraIds.size}`);

  const trituraArr = Array.from(trituraIds);

  // 1. Default non-Tritura to 'cp' or 'cemara'
  // Let's set the 93 IDs to 'tritura'
  await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'tritura', updated_at = NOW()
    WHERE trainee_id = ANY($1::text[]);
  `, [trituraArr]);

  // 2. Set all remaining trainees that are NOT in tritura to 'cp'
  await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'cp', updated_at = NOW()
    WHERE NOT (trainee_id = ANY($1::text[]));
  `, [trituraArr]);

  const result = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id;');
  console.log('--- UPDATED Branch Distribution ---');
  console.table(result.rows);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
