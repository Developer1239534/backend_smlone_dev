const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('❌ transcript_full.jsonl not found at:', transcriptPath);
    return;
  }

  const stats = fs.statSync(transcriptPath);
  console.log(`✅ transcript_full.jsonl exists. Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  console.log('Reading transcript...');
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');

  console.log(`Total steps in full transcript: ${lines.length}`);
  
  let matchCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const step = JSON.parse(line);
      if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
        const text = step.content || '';
        if (text.includes('gp_tahunan') || text.includes('31 Dec 2026') || text.includes('Student Name')) {
          console.log(`\n===========================================`);
          console.log(`🎯 MATCH FOUND at Step Index: ${step.step_index}`);
          console.log(`Content length: ${text.length} characters`);
          console.log('First 300 chars:', text.substring(0, 300));
          console.log('Last 300 chars:', text.substring(text.length - 300));
          
          // Write this content to a separate file to inspect or parse
          const outPath = path.join(__dirname, `user-request-step-${step.step_index}.txt`);
          fs.writeFileSync(outPath, text, 'utf8');
          console.log(`Saved full content to: ${outPath}`);
          matchCount++;
        }
      }
    } catch (err) {
      // ignore JSON parse error
    }
  }

  console.log(`\nTotal matches found: ${matchCount}`);
}

main();
