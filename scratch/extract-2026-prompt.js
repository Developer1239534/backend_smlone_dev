const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\c6c4fc5a-65b1-4401-9c9f-d694f0833477\\.system_generated\\logs\\transcript_full.jsonl';
const outputPath = path.join(__dirname, 'full-user-prompt-2026.txt');

async function extract() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let latestContent = '';

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content && obj.content.includes('Jan-Apr 2026')) {
        latestContent = obj.content;
      }
    } catch (e) {
      // ignore
    }
  }

  if (latestContent) {
    fs.writeFileSync(outputPath, latestContent);
    console.log(`Successfully extracted latest 2026 dataset (length: ${latestContent.length}) to ${outputPath}`);
  } else {
    console.log('No USER_INPUT containing "Jan-Apr 2026" found');
  }
}

extract().catch(console.error);
