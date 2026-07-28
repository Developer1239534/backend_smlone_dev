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

  // Prompt #84 is Tritura list
  // Prompt #85 is Cemara list
  // Prompt #86 is CP list
  const trituraPrompt = promptHistory[promptHistory.length - 3];
  const cemaraPrompt = promptHistory[promptHistory.length - 2];

  const trituraIds = new Set();
  for (let l of trituraPrompt.split(/\r?\n/)) {
    l = l.trim();
    if (/^[a-zA-Z0-9]+$/.test(l) && l !== 'ID' && l.toLowerCase() !== 'yang' && l.toLowerCase() !== 'kenapa') {
      trituraIds.add(l);
    }
  }

  const cemaraIds = new Set();
  for (let l of cemaraPrompt.split(/\r?\n/)) {
    l = l.trim();
    if (/^[a-zA-Z0-9]+$/.test(l) && l !== 'ID' && l.toLowerCase() !== 'ini' && l.toLowerCase() !== 'untuk' && l.toLowerCase() !== 'cemara' && l.toLowerCase() !== 'ya') {
      cemaraIds.add(l);
    }
  }

  const trituraArr = Array.from(trituraIds);
  const cemaraOnlyArr = Array.from(cemaraIds).filter(id => !trituraIds.has(id));

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

  // 3. Update CP (remaining)
  await db.query(`
    UPDATE portal_trainee
    SET branch_id = 'cp', updated_at = NOW()
    WHERE NOT (trainee_id = ANY($1::text[])) AND NOT (trainee_id = ANY($2::text[]));
  `, [trituraArr, cemaraOnlyArr]);

  const finalBranch = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id ORDER BY COUNT(*) DESC;');
  console.log('--- RESTORED ACCURATE Branch Distribution ---');
  console.table(finalBranch.rows);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
