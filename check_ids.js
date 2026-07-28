const fs = require('fs');
const readline = require('readline');

async function checkIds() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(fullTranscriptPath, { encoding: 'utf8' });
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

  const lines = lastUserText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  console.log('Total non-empty lines in last user text:', lines.length);

  const nonUrlLines = lines.filter(l => !l.includes('http://') && !l.includes('https://') && !l.includes('<USER_REQUEST>'));
  console.log('Non-URL lines sample:', nonUrlLines.slice(0, 20));
}

checkIds();
