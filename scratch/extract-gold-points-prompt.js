const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';
const outputPath = path.join(__dirname, 'latest-user-request-gold-points.txt');

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript not found.');
    process.exit(1);
  }

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');
  
  let latestUserInput = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(lines[i]);
      if (obj.type === 'USER_INPUT') {
        if (obj.content.includes('ini data gold poin yang terbaru yaa')) {
          latestUserInput = obj.content;
          break;
        }
      }
    } catch (e) {}
  }

  if (!latestUserInput) {
    console.error('Latest user input with gold points not found.');
    process.exit(1);
  }

  // Strip the <USER_REQUEST> tags if present
  let cleanContent = latestUserInput;
  if (cleanContent.startsWith('<USER_REQUEST>')) {
    cleanContent = cleanContent.replace('<USER_REQUEST>', '').replace('</USER_REQUEST>', '');
  }

  fs.writeFileSync(outputPath, cleanContent.trim(), 'utf8');
  console.log(`Successfully extracted gold points data to: ${outputPath}`);
}

main();
