const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

async function main() {
  try {
    if (!fs.existsSync(transcriptPath)) {
      console.error('Transcript not found.');
      process.exit(1);
    }

    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n');
    
    let latestUserInput = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj.type === 'USER_INPUT') {
          if (obj.content.includes('Speaking Project to Next Level')) {
            latestUserInput = obj.content;
            break;
          }
        }
      } catch (e) {}
    }

    if (!latestUserInput) {
      console.error('Latest user input with speaking project table not found.');
      process.exit(1);
    }

    // Parse the input lines
    const parsedRows = [];
    const inputLines = latestUserInput.split('\n');
    for (const line of inputLines) {
      const parts = line.trim().split(/\t/);
      let id, name, val;

      if (parts.length >= 3) {
        id = parts[0].trim();
        name = parts[1].trim();
        val = parts[2].trim() || null;
      } else {
        // Fallback split by multiple spaces
        const words = line.trim().split(/\s{2,}/);
        if (words.length >= 2) {
          id = words[0].trim();
          // Check if there's a percentage at the end
          const lastWord = words[words.length - 1];
          if (lastWord.endsWith('%')) {
            val = lastWord;
            name = words.slice(1, words.length - 1).join(' ').trim();
          } else {
            val = null;
            name = words.slice(1).join(' ').trim();
          }
        } else {
          // Check if it has a tab or space separator
          const tokens = line.trim().split(/\s+/);
          if (tokens.length >= 2) {
            id = tokens[0];
            const lastToken = tokens[tokens.length - 1];
            if (lastToken.endsWith('%')) {
              val = lastToken;
              name = tokens.slice(1, tokens.length - 1).join(' ');
            } else {
              val = null;
              name = tokens.slice(1).join(' ');
            }
          }
        }
      }

      // Check if id is numeric
      if (id && /^\d+$/.test(id)) {
        parsedRows.push({ id, name, val });
      }
    }

    console.log(`Parsed ${parsedRows.length} rows to update.`);
    if (parsedRows.length === 0) {
      console.log('No rows parsed. Please check format.');
      process.exit(1);
    }

    let updateCount = 0;
    let notFoundCount = 0;
    const notFoundTrainees = [];

    // Reset all speaking_project_to_next_level columns first?
    // Wait, the user is giving a full list of all trainees and their values, so we can just update them.
    for (const row of parsedRows) {
      // Check if trainee exists
      const checkRes = await db.query('SELECT id FROM dashboard_trainne WHERE id = $1', [row.id]);
      if (checkRes.rows.length > 0) {
        await db.query(
          'UPDATE dashboard_trainne SET speaking_project_to_next_level = $1 WHERE id = $2',
          [row.val, row.id]
        );
        updateCount++;
      } else {
        notFoundCount++;
        notFoundTrainees.push(row);
      }
    }

    console.log('\n=== SPEAKING PROJECT TO NEXT LEVEL UPDATE COMPLETE ===');
    console.log(`Updated:   ${updateCount}`);
    console.log(`Not Found: ${notFoundCount}`);

    if (notFoundTrainees.length > 0) {
      console.log('\n=== NOT FOUND TRAINEES (Not in DB) ===');
      console.log(notFoundTrainees);
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
