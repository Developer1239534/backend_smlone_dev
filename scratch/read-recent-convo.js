const fs = require('fs');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript.jsonl';

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript not found.');
    process.exit(1);
  }

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');
  
  let userCount = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    let obj;
    try {
      obj = JSON.parse(lines[i]);
    } catch (e) {
      continue;
    }
    if (obj.type === 'USER_INPUT') {
      userCount++;
      console.log(`\n==================== USER INPUT ${userCount} (Line ${i}) ====================`);
      console.log(obj.content ? obj.content.substring(0, 1000) : '[No Content]');
      
      // Look forward for MODEL responses
      for (let j = i + 1; j < lines.length; j++) {
        let nextObj;
        try {
          nextObj = JSON.parse(lines[j]);
        } catch (e) {
          continue;
        }
        if (nextObj.type === 'USER_INPUT') {
          break; // Stop at next user input
        }
        if (nextObj.type === 'PLANNER_RESPONSE' && nextObj.content) {
          console.log(`==================== MODEL RESPONSE (Line ${j}) ====================`);
          console.log(nextObj.content.substring(0, 2000));
        }
      }
      if (userCount >= 3) break;
    }
  }
}

main();
