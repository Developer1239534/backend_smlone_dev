const fs = require('fs');
const path = 'C:/Users/ASUS ROG/.gemini/antigravity/brain/c6c4fc5a-65b1-4401-9c9f-d694f0833477/.system_generated/logs/transcript_full.jsonl';

try {
  const lines = fs.readFileSync(path, 'utf8').split('\n');
  let found = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT') {
        console.log('Found latest USER_INPUT! Length:', obj.content.length);
        fs.writeFileSync('scratch/latest-user-request-2026.txt', obj.content);
        console.log('Successfully saved to scratch/latest-user-request-2026.txt');
        found = true;
        break;
      }
    } catch (e) {
      // ignore JSON parse errors on partial/incomplete lines
    }
  }
  if (!found) {
    console.error('❌ Could not find USER_INPUT in transcript_full.jsonl');
    process.exit(1);
  }
  process.exit(0);
} catch (err) {
  console.error('❌ Error reading transcript:', err);
  process.exit(1);
}
