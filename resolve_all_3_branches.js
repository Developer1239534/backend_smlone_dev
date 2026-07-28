const fs = require('fs');
const readline = require('readline');
const db = require('./src/db/neonClient');

async function main() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';

  const fileStream = fs.createReadStream(fullTranscriptPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let promptHistory = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        promptHistory.push(obj.content);
      }
    } catch (e) {}
  }

  // Last prompt is Cemara list
  const cemaraPrompt = promptHistory[promptHistory.length - 1];
  // Second to last prompt is Tritura list
  const trituraPrompt = promptHistory[promptHistory.length - 2];

  const cemaraIds = new Set();
  for (let l of cemaraPrompt.split(/\r?\n/)) {
    l = l.trim();
    if (/^[a-zA-Z0-9]+$/.test(l) && l !== 'ID' && l.toLowerCase() !== 'ini' && l.toLowerCase() !== 'untuk' && l.toLowerCase() !== 'cemara' && l.toLowerCase() !== 'ya') {
      cemaraIds.add(l);
    }
  }

  const trituraIds = new Set();
  for (let l of trituraPrompt.split(/\r?\n/)) {
    l = l.trim();
    if (/^[a-zA-Z0-9]+$/.test(l) && l !== 'ID' && l.toLowerCase() !== 'yang' && l.toLowerCase() !== 'kenapa') {
      trituraIds.add(l);
    }
  }

  console.log(`📊 Tritura IDs parsed: ${trituraIds.size}`);
  console.log(`📊 Cemara IDs parsed:  ${cemaraIds.size}`);

  // Deduplicate / prioritize: Tritura IDs get 'tritura'
  const trituraArr = Array.from(trituraIds);
  // Cemara IDs get 'cemara' EXCEPT if they are in Tritura IDs
  const cemaraOnlyArr = Array.from(cemaraIds).filter(id => !trituraIds.has(id));

  console.log(`✅ Tritura count to apply: ${trituraArr.length}`);
  console.log(`✅ Cemara count to apply:  ${cemaraOnlyArr.length}`);

  // 1. Update Cemara
  await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'cemara', updated_at = NOW()
    WHERE trainee_id = ANY($1::text[]);
  `, [cemaraOnlyArr]);

  // 2. Update Tritura
  await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'tritura', updated_at = NOW()
    WHERE trainee_id = ANY($1::text[]);
  `, [trituraArr]);

  // 3. Any remaining IDs set to 'cp'
  const cpRes = await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'cp', updated_at = NOW()
    WHERE NOT (trainee_id = ANY($1::text[])) AND NOT (trainee_id = ANY($2::text[]))
    RETURNING trainee_id;
  `, [trituraArr, cemaraOnlyArr]);

  console.log(`✅ Remaining set to CP count: ${cpRes.rowCount}`);

  const finalBranch = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id ORDER BY COUNT(*) DESC;');
  console.log('--- ACCURATE FINAL Branch Distribution ---');
  console.table(finalBranch.rows);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
