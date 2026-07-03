const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

async function main() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastUserRequest = null;
  let stepCount = 0;

  for await (const line of rl) {
    stepCount++;
    if (!line.trim()) continue;

    try {
      const step = JSON.parse(line);
      if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
        lastUserRequest = step;
      }
    } catch (e) {}
  }

  console.log(`Total steps: ${stepCount}`);
  if (lastUserRequest) {
    console.log(`Latest user request step index: ${lastUserRequest.step_index}`);
    console.log(`Content length: ${lastUserRequest.content.length} characters.`);
    console.log('First 500 characters of content:');
    console.log(lastUserRequest.content.substring(0, 500));
  } else {
    console.log('No user request found.');
  }
}

main();
