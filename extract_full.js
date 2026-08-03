const fs = require('fs');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\9beb73e7-e676-4eaa-a35f-bc916c6c9b49\\.system_generated\\logs\\transcript_full.jsonl';

const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
for (let line of lines) {
  const obj = JSON.parse(line);
  if (obj.step_index === 37) {
    fs.writeFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', obj.content || '');
    console.log('Saved full user prompt text, length:', (obj.content || '').length);
    break;
  }
}
