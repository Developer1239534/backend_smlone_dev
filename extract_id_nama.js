const fs = require('fs');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\9beb73e7-e676-4eaa-a35f-bc916c6c9b49\\.system_generated\\logs\\transcript_full.jsonl';

const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  const obj = JSON.parse(lines[i]);
  const str = JSON.stringify(obj);
  if (str.includes('Andrea Tabitha Florencia Simatupang')) {
    fs.writeFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\id_nama_raw.txt', str);
    console.log('Found matching line in transcript at step', obj.step_index);
    break;
  }
}
