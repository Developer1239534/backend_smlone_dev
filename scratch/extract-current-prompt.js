const fs = require('fs');
const path = require('path');

const conversationId = '7708b8af-fc75-445b-9958-18e15e5fbc17';
const appDataDir = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity';
const transcriptPath = path.join(appDataDir, 'brain', conversationId, '.system_generated', 'logs', 'transcript_full.jsonl');

async function main() {
  try {
    if (!fs.existsSync(transcriptPath)) {
      console.error(`Transcript file not found: ${transcriptPath}`);
      process.exit(1);
    } else {
      extractFrom(transcriptPath);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function extractFrom(filePath) {
  console.log(`Reading from: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  
  // Find the last USER_INPUT step
  let lastUserInput = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(lines[i]);
      if (obj.type === 'USER_INPUT') {
        lastUserInput = obj.content;
        break;
      }
    } catch (e) {
      // ignore parse errors for partially written lines
    }
  }

  if (!lastUserInput) {
    console.error('Could not find USER_INPUT in transcript.');
    process.exit(1);
  }

  const outputPath = path.join(__dirname, 'latest-user-request-real-stages.txt');
  fs.writeFileSync(outputPath, lastUserInput, 'utf8');
  console.log(`Successfully extracted USER_INPUT to: ${outputPath}`);
  console.log(`Content size: ${lastUserInput.length} characters`);
}

main();
