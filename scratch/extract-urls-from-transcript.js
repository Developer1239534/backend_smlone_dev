const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

function main() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript not found at: ' + transcriptPath);
    process.exit(1);
  }

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');
  
  let latestUserInput = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(lines[i]);
      if (obj.type === 'USER_INPUT') {
        latestUserInput = obj.content;
        break;
      }
    } catch (e) {
      // ignore parse error
    }
  }

  if (!latestUserInput) {
    console.error('No USER_INPUT found in transcript');
    process.exit(1);
  }

  // Regex to match URLs
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(latestUserInput)) !== null) {
    let cleanUrl = match[0].trim();
    // Clean trailing punctuation or brackets if any
    cleanUrl = cleanUrl.replace(/[.,;:\)\]]+$/, '');
    urls.push(cleanUrl);
  }

  console.log(`Extracted ${urls.length} URLs from the last user input.`);
  console.log('Sample of URLs:', urls.slice(0, 10));

  const outputPath = path.join(__dirname, 'raw_urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(urls, null, 2), 'utf8');
  console.log(`Saved URLs to ${outputPath}`);
}

main();
