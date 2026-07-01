const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFilePath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

async function main() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastUserRequest = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT') {
        lastUserRequest = obj.content;
      }
    } catch (err) {
      // ignore parse errors
    }
  }

  if (lastUserRequest) {
    console.log('Found last USER_INPUT. Length:', lastUserRequest.length);
    fs.writeFileSync('c:\\Users\\ASUS ROG\\Documents\\BE\\backend_smlone_dev\\scratch\\full-request.txt', lastUserRequest);
    console.log('Saved to scratch/full-request.txt');
  } else {
    console.log('No USER_INPUT found in transcript.');
  }
}

main();
