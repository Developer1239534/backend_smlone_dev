const fs = require('fs');
const path = require('path');

function main() {
  const dir = __dirname;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('6 Jan 2026') || content.includes('gp_tahunan') || content.includes('31 Dec 2026')) {
        console.log(`Match found in: ${file} (Size: ${content.length} chars)`);
      }
    }
  }
}

main();
