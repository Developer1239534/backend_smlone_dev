const fs = require('fs');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\9beb73e7-e676-4eaa-a35f-bc916c6c9b49\\.system_generated\\logs\\transcript_full.jsonl';

const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
let latestUserText = '';
for (let i = lines.length - 1; i >= 0; i--) {
  const obj = JSON.parse(lines[i]);
  if (obj.type === 'USER_INPUT') {
    latestUserText = obj.content || '';
    break;
  }
}

fs.writeFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\id_nama_mapping.txt', latestUserText);
console.log('Saved ID-Nama mapping, length:', latestUserText.length);
