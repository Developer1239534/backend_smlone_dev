const fs = require('fs');
const readline = require('readline');

async function inspect() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(fullTranscriptPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let idx = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        idx++;
        const text = obj.content;
        const firstLine = text.split('\n')[0].trim();
        console.log(`Prompt #${idx}: ${firstLine.substring(0, 80)} (length: ${text.length})`);
      }
    } catch (e) {}
  }
}

inspect();
