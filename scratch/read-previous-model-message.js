const fs = require('fs');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript.jsonl';

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript not found.');
    process.exit(1);
  }

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');
  
  // Find the step right before USER_INPUT 1 (line 1327)
  // Let's print steps 1320 to 1326
  for (let i = 1320; i < 1327; i++) {
    try {
      const obj = JSON.parse(lines[i]);
      console.log(`\nLine ${i} (Index: ${obj.step_index}, Source: ${obj.source}, Type: ${obj.type})`);
      if (obj.content) {
        console.log(obj.content);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

main();
