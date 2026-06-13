const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\faa8c175-a20d-47af-af0e-98a66846f5d4\\.system_generated\\logs\\transcript_full.jsonl';
const outPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\faa8c175-a20d-47af-af0e-98a66846f5d4\\raw_data_newest.txt';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastMatchingContent = null;

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content && parsed.content.toLowerCase().includes('hapus ss_hub')) {
        lastMatchingContent = parsed.content;
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  if (lastMatchingContent) {
    fs.writeFileSync(outPath, lastMatchingContent, 'utf8');
    console.log('Successfully extracted the new data to', outPath);
  } else {
    console.log('Could not find the target message.');
  }
}

processLineByLine();
