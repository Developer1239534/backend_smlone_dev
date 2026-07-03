const fs = require('fs');
const path = 'C:/Users/ASUS ROG/.gemini/antigravity/brain/c6c4fc5a-65b1-4401-9c9f-d694f0833477/.system_generated/logs/transcript_full.jsonl';

try {
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  
  let b1Content = '';
  let b2Content = '';
  let b3Content = '';

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT') {
        if (obj.content.includes('96\tJan - Mar 2023\thttps://docs.google.com')) {
          b1Content = obj.content;
          console.log('Found Batch 1! Length:', b1Content.length);
        } else if (obj.content.includes('429\tJan - Mar 2023\t\thttps://docs.google.com')) {
          b2Content = obj.content;
          console.log('Found Batch 2! Length:', b2Content.length);
        } else if (obj.content.includes('671\tJuly - Sept 2023\t\thttps://docs.google.com')) {
          b3Content = obj.content;
          console.log('Found Batch 3! Length:', b3Content.length);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (b1Content) fs.writeFileSync('scratch/request-2023-b1.txt', b1Content);
  if (b2Content) fs.writeFileSync('scratch/request-2023-b2.txt', b2Content);
  if (b3Content) fs.writeFileSync('scratch/request-2023-b3.txt', b3Content);

  console.log('Extraction completed successfully.');
  process.exit(0);
} catch (err) {
  console.error('❌ Error reading transcript:', err);
  process.exit(1);
}
