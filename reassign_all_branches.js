const fs = require('fs');
const readline = require('readline');
const db = require('./src/db/neonClient');

async function main() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';

  if (!fs.existsSync(fullTranscriptPath)) {
    console.error('Full transcript file not found at:', fullTranscriptPath);
    process.exit(1);
  }

  console.log('📖 Reading full transcript to classify ALL branches...');

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

        let targetBranch = null;
        if (lower.includes('branch tritura') || lower.includes('id untuk tritura')) {
          targetBranch = 'tritura';
        } else if (lower.includes('branch cemara')) {
          targetBranch = 'cemara';
        } else if (lower.includes('branch cp')) {
          targetBranch = 'cp';
        }

        if (targetBranch) {
          const lines = text.split(/\r?\n/);
          for (let l of lines) {
            l = l.trim();
            if (!l) continue;

            // Same line match e.g. "602 ▶️ Progress Video ..." or "35 REFERRAL CODE ..." or "70100036 Real Stage 38 ..." or "96 Jan - Mar 2023 ..."
            const matchFirstToken = l.match(/^([a-zA-Z0-9]+)\s+/);
            if (matchFirstToken) {
              const id = matchFirstToken[1].trim();
              if (id !== 'ID' && id !== 'Report' && id !== 'Title' && id !== 'Link' && id.toLowerCase() !== 'yang' && id.toLowerCase() !== 'kee' && id.toLowerCase() !== 'kenapa') {
                if (targetBranch === 'tritura') trituraIds.add(id);
                if (targetBranch === 'cemara') cemaraIds.add(id);
                if (targetBranch === 'cp') cpIds.add(id);
              }
            } else if (/^[a-zA-Z0-9]+$/.test(l)) {
              if (l !== 'ID' && l.toLowerCase() !== 'yang' && l.toLowerCase() !== 'kenapa') {
                if (targetBranch === 'tritura') trituraIds.add(l);
                if (targetBranch === 'cemara') cemaraIds.add(l);
                if (targetBranch === 'cp') cpIds.add(l);
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  console.log(`📊 Classifications parsed from conversation:`);
  console.log(`   - Tritura IDs: ${trituraIds.size}`);
  console.log(`   - Cemara IDs:  ${cemaraIds.size}`);
  console.log(`   - CP IDs:      ${cpIds.size}`);

  // Re-assign branches in database
  // Note: Order of precedence if an ID appeared in multiple branch prompts:
  // Branch assignment should prioritize explicit prompts. Let's update each group carefully.

  if (cpIds.size > 0) {
    const cpArr = Array.from(cpIds);
    await db.query(`UPDATE portal_trainee SET branch_id = 'cp' WHERE trainee_id = ANY($1::text[]);`, [cpArr]);
  }

  if (cemaraIds.size > 0) {
    const cemaraArr = Array.from(cemaraIds);
    await db.query(`UPDATE portal_trainee SET branch_id = 'cemara' WHERE trainee_id = ANY($1::text[]);`, [cemaraArr]);
  }

  if (trituraIds.size > 0) {
    const trituraArr = Array.from(trituraIds);
    await db.query(`UPDATE portal_trainee SET branch_id = 'tritura' WHERE trainee_id = ANY($1::text[]);`, [trituraArr]);
  }

  const finalBranch = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id;');
  console.log('--- FINAL Branch Distribution ---');
  console.table(finalBranch.rows);
}

main().catch(err => {
  console.error('❌ Reassign error:', err);
  process.exit(1);
});
