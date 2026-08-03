const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

const parts = raw.split(/ini juga ya letakkan di tabel link_report/i);
const part2 = parts[1] || '';

function cleanUrl(str) {
  if (!str) return '';
  const match = str.match(/\((https?:\/\/[^\)]+)\)/);
  if (match) return match[1];
  const plainMatch = str.match(/https?:\/\/[^\s\]]+/);
  if (plainMatch) return plainMatch[0];
  return str.trim();
}

const p2Lines = part2.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
const p2DataLines = p2Lines.filter(l => 
  !l.startsWith('Trainee_id') && 
  !l.startsWith('Nama') && 
  !l.startsWith('Link YT') &&
  !l.startsWith('</USER_REQUEST>') &&
  !l.startsWith('<truncated') &&
  !l.startsWith('NOTE:')
);

const p2Records = [];
let j = 0;
while (j < p2DataLines.length) {
  const line1 = p2DataLines[j];
  const line2 = p2DataLines[j+1];
  const line3 = p2DataLines[j+2];

  if (line3 && (line3.includes('youtube.com') || line3.includes('youtu.be') || line3.includes('http'))) {
    p2Records.push({ trainee_id: line1, nama: line2, link_youtube: cleanUrl(line3) });
    j += 3;
  } else if (line2 && (line2.includes('youtube.com') || line2.includes('youtu.be') || line2.includes('http'))) {
    p2Records.push({ trainee_id: line1, nama: '', link_youtube: cleanUrl(line2) });
    j += 2;
  } else if (line1 && /^\d+$/.test(line1) && line2 && !line2.includes('http')) {
    p2Records.push({ trainee_id: line1, nama: line2, link_youtube: null });
    j += 2;
  } else {
    j++;
  }
}

const dupeIds = ['549', '588', '701', '740', '70100071'];
dupeIds.forEach(id => {
  console.log('--- Duplicate ID:', id);
  console.log(p2Records.filter(r => r.trainee_id === id));
});
