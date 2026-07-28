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

  // Prompt #84 -> Tritura IDs prompt
  // Prompt #85 -> Cemara IDs prompt
  // Prompt #87 -> CP IDs prompt (latest prompt)
  const cpPrompt = promptHistory[promptHistory.length - 1];
  const cemaraPrompt = promptHistory[promptHistory.length - 3];
  const trituraPrompt = promptHistory[promptHistory.length - 4];

  const trituraIds = new Set();
  if (trituraPrompt) {
    for (let l of trituraPrompt.split(/\r?\n/)) {
      l = l.trim();
      if (/^[a-zA-Z0-9]+$/.test(l) && l !== 'ID' && l.toLowerCase() !== 'yang' && l.toLowerCase() !== 'kenapa') {
        trituraIds.add(l);
      }
    }
  }

  const cpIds = new Set();
  if (cpPrompt) {
    for (let l of cpPrompt.split(/\r?\n/)) {
      l = l.trim();
      if (/^[a-zA-Z0-9]+$/.test(l) && l !== 'ID' && l.toLowerCase() !== 'ini' && l.toLowerCase() !== 'untuk' && l.toLowerCase() !== 'cp' && l.toLowerCase() !== 'ya' && l.toLowerCase() !== 'kenapa') {
        cpIds.add(l);
      }
    }
  }

  console.log(`📊 Tritura unique IDs parsed: ${trituraIds.size}`);
  console.log(`📊 CP unique IDs parsed:      ${cpIds.size}`);

  // Query all trainees in portal_trainee
  const allTraineesRes = await db.query('SELECT trainee_id FROM portal_trainee;');
  const allTraineeIds = allTraineesRes.rows.map(r => r.trainee_id);
  console.log(`📊 Total trainees in DB:      ${allTraineeIds.length}`);

  // Determine branch assignment:
  // 1. If in Tritura prompt -> 'tritura'
  // 2. If in CP prompt (and not Tritura) -> 'cp'
  // 3. Otherwise -> 'cemara'

  const trituraMatch = allTraineeIds.filter(id => trituraIds.has(id));
  const cpMatch = allTraineeIds.filter(id => cpIds.has(id) && !trituraIds.has(id));
  const cemaraMatch = allTraineeIds.filter(id => !trituraIds.has(id) && !cpIds.has(id));

  console.log(`🎯 Assigned Tritura: ${trituraMatch.length}`);
  console.log(`🎯 Assigned CP:      ${cpMatch.length}`);
  console.log(`🎯 Assigned Cemara:  ${cemaraMatch.length}`);

  if (trituraMatch.length > 0) {
    await db.query(`UPDATE portal_trainee SET branch_id = 'tritura', updated_at = NOW() WHERE trainee_id = ANY($1::text[]);`, [trituraMatch]);
  }

  if (cpMatch.length > 0) {
    await db.query(`UPDATE portal_trainee SET branch_id = 'cp', updated_at = NOW() WHERE trainee_id = ANY($1::text[]);`, [cpMatch]);
  }

  if (cemaraMatch.length > 0) {
    await db.query(`UPDATE portal_trainee SET branch_id = 'cemara', updated_at = NOW() WHERE trainee_id = ANY($1::text[]);`, [cemaraMatch]);
  }

  const finalBranch = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id ORDER BY COUNT(*) DESC;');
  console.log('--- BALANCED Branch Distribution ---');
  console.table(finalBranch.rows);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
