const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript.jsonl';

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript not found');
    process.exit(1);
  }

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');
  
  let count = 0;
  console.log('=== LAST 15 USER INPUTS (Shortened) ===');
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(lines[i]);
      if (obj.type === 'USER_INPUT') {
        const text = obj.content.replace(/\r\n/g, '\n');
        console.log(`\n--- Input ${++count} ---`);
        console.log(text.substring(0, 500) + (text.length > 500 ? '... [TRUNCATED]' : ''));
        if (count >= 15) break;
      }
    } catch (e) {
      // ignore parse error
    }
  }
}

main();
