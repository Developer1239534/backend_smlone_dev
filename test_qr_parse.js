const fs = require('fs');
const readline = require('readline');

async function checkParsing() {
  const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lastUserText = '';
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        lastUserText = obj.content;
      }
    } catch (e) {}
  }

  console.log('--- USER INPUT FIRST 500 CHARS ---');
  console.log(lastUserText.substring(0, 500));
  console.log('--- USER INPUT LAST 500 CHARS ---');
  console.log(lastUserText.substring(lastUserText.length - 500));

  // Let's test a regex that matches ALL occurrences of "ID  ReportTitle  URL" or multi-lines
  const regex = /([a-zA-Z0-9]+)\s+([A-Za-z0-9\s\-]+)\s+(https?:\/\/[^\s]+)/g;
  let match;
  const items = new Map();
  while ((match = regex.exec(lastUserText)) !== null) {
    const id = match[1].trim();
    const title = match[2].trim();
    const url = match[3].trim();
    if (id !== 'ID' && id !== 'Report' && id !== 'Title') {
      items.set(id, url);
    }
  }

  console.log(`Regex found ${items.size} unique IDs. Sample:`, Array.from(items.entries()).slice(0, 5));
}

checkParsing().catch(console.error);
