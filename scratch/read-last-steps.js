const fs = require('fs');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript.jsonl';

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript not found.');
    process.exit(1);
  }

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');
  
  console.log(`Total steps: ${lines.length}`);
  
  // Let's print the last 5 steps (just their type and some snippet of content)
  const lastN = 10;
  const start = Math.max(0, lines.length - lastN);
  for (let i = start; i < lines.length; i++) {
    try {
      const obj = JSON.parse(lines[i]);
      console.log(`\n--- Step ${obj.step_index} (${obj.source} - ${obj.type}) ---`);
      console.log(obj.content ? obj.content.substring(0, 1000) : '[No Content]');
    } catch (e) {
      console.error(`Error parsing line ${i}:`, e);
    }
  }
}

main();
