const fs = require('fs');
const path = 'C:/Users/ASUS ROG/.gemini/antigravity/brain/c6c4fc5a-65b1-4401-9c9f-d694f0833477/.system_generated/logs/transcript_full.jsonl';

try {
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  let found = false;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content.includes('1rddV9_NloCUx5u02-RgTvtIEtUWwb2SVO_SN02glM9Q')) {
        console.log('Found 2023 USER_INPUT! Length:', obj.content.length);
        fs.writeFileSync('scratch/latest-user-request-2023.txt', obj.content);
        console.log('Successfully saved to scratch/latest-user-request-2023.txt');
        found = true;
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!found) {
    console.error('❌ Could not find 2023 USER_INPUT in transcript_full.jsonl');
    process.exit(1);
  }
  process.exit(0);
} catch (err) {
  console.error('❌ Error reading transcript:', err);
  process.exit(1);
}
