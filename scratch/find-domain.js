const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript.jsonl';

async function main() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const domainsFound = new Set();
  for await (const line of rl) {
    const matches = line.match(/[a-zA-Z0-9.-]+\.(com|id|net|org|xyz|co\.id|io|dev)/g);
    if (matches) {
      matches.forEach(m => domainsFound.add(m));
    }
  }

  console.log('Domains found in transcript:');
  domainsFound.forEach(d => console.log(`- ${d}`));
}

main();
