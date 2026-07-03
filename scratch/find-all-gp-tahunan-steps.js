const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

async function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('❌ transcript_full.jsonl not found at:', transcriptPath);
    return;
  }

  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let stepCount = 0;
  let matches = [];

  for await (const line of rl) {
    stepCount++;
    if (!line.trim()) continue;

    try {
      const step = JSON.parse(line);
      if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
        const text = step.content || '';
        // Look for typical markers of gp_tahunan data
        if (text.includes('6 Jan 2026') || text.includes('Student Name') || text.includes('Total Gold')) {
          matches.push({
            step_index: step.step_index,
            length: text.length,
            preview: text.substring(0, 150)
          });
        }
      }
    } catch (err) {
      // ignore
    }
  }

  console.log(`\nScan finished. Total steps parsed: ${stepCount}`);
  console.log(`Found ${matches.length} matches containing gp_tahunan markers:`);
  console.table(matches);
}

main();
