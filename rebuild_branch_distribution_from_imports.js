const fs = require('fs');
const readline = require('readline');
const db = require('./src/db/neonClient');

async function main() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';

  const fileStream = fs.createReadStream(fullTranscriptPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const trituraIds = new Set();
  const cemaraIds = new Set();
  const cpIds = new Set();

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        const text = obj.content;
        const lower = text.toLowerCase();

        // Check if prompt is a data import for a specific branch
        if (lower.includes('branch tritura') || lower.includes('id untuk tritura')) {
          extractIds(text, trituraIds);
        } else if (lower.includes('branch cemara') || (lower.includes('untuk cemara') && !lower.includes('id untuk cp'))) {
          extractIds(text, cemaraIds);
        } else if (lower.includes('branch cp') || lower.includes('untuk cp')) {
          extractIds(text, cpIds);
        }
      }
    } catch (e) {}
  }

  function extractIds(text, targetSet) {
    const lines = text.split(/\r?\n/);
    for (let l of lines) {
      l = l.trim();
      if (!l) continue;
      // Match Trainee ID at start of line
      const m = l.match(/^([a-zA-Z0-9]+)(\s+|$)/);
      if (m) {
        const id = m[1].trim();
        if (id !== 'ID' && id !== 'Report' && id !== 'Title' && id !== 'Link' && id.toLowerCase() !== 'yang' && id.toLowerCase() !== 'ini' && id.toLowerCase() !== 'untuk' && id.toLowerCase() !== 'cemara' && id.toLowerCase() !== 'cp' && id.toLowerCase() !== 'tritura' && id.toLowerCase() !== 'kenapa') {
          targetSet.add(id);
        }
      }
    }
  }

  console.log(`📊 Original Import Prompts Analysis:`);
  console.log(`   - Tritura IDs parsed: ${trituraIds.size}`);
  console.log(`   - Cemara IDs parsed:  ${cemaraIds.size}`);
  console.log(`   - CP IDs parsed:      ${cpIds.size}`);

  // Query DB to see how many of DB's 1,154 trainees match Cemara, CP, Tritura
  const allDbTrainees = await db.query('SELECT trainee_id FROM portal_trainee;');
  const dbIds = allDbTrainees.rows.map(r => r.trainee_id);

  let inCemara = 0;
  let inCP = 0;
  let inTritura = 0;

  for (const id of dbIds) {
    if (trituraIds.has(id)) inTritura++;
    if (cemaraIds.has(id)) inCemara++;
    if (cpIds.has(id)) inCP++;
  }

  console.log(`🔍 DB Trainees matching Cemara import prompts: ${inCemara}`);
  console.log(`🔍 DB Trainees matching CP import prompts:     ${inCP}`);
  console.log(`🔍 DB Trainees matching Tritura import prompts: ${inTritura}`);
}

main().catch(err => {
  console.error('❌ Analysis error:', err);
  process.exit(1);
});
