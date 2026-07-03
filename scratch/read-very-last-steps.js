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
  
  const start = Math.max(0, lines.length - 15);
  for (let i = start; i < lines.length; i++) {
    try {
      const obj = JSON.parse(lines[i]);
      console.log(`\n=== Step ${i} (Index: ${obj.step_index}, Source: ${obj.source}, Type: ${obj.type}) ===`);
      if (obj.content) {
        console.log(obj.content);
      } else if (obj.tool_calls) {
        console.log('Tool calls:', JSON.stringify(obj.tool_calls, null, 2));
      } else {
        console.log('[No content or tool calls]');
      }
    } catch (e) {
      console.error(`Error parsing line ${i}:`, e);
    }
  }
}

main();
