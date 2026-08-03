const fs = require('fs');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\9beb73e7-e676-4eaa-a35f-bc916c6c9b49\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  const obj = JSON.parse(lines[i]);
  if (obj.type === 'USER_INPUT') {
    fs.writeFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\raw_user_prompt.txt', JSON.stringify(obj, null, 2));
    console.log('Saved step', obj.step_index, 'to raw_user_prompt.txt');
    break;
  }
}
