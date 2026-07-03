const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript.jsonl';

async function main() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const matches = new Set();
  for await (const line of rl) {
    if (line.includes('logo') || line.includes('cloudinary') || line.includes('http')) {
      const urls = line.match(/https?:\/\/[^\s"',]+/g);
      if (urls) {
        urls.forEach(u => {
          if (u.includes('logo') || u.includes('cloudinary') || u.includes('image')) {
            matches.add(u);
          }
        });
      }
    }
  }

  console.log('Found matching URLs in logs:');
  matches.forEach(m => console.log('-', m));
}

main();
