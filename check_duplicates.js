const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

const parts = raw.split(/ini juga ya letakkan di tabel link_report/i);
const part1 = parts[0];
const part2 = parts[1] || '';

function cleanUrl(str) {
  if (!str) return '';
  const match = str.match(/\((https?:\/\/[^\)]+)\)/);
  if (match) return match[1];
  const plainMatch = str.match(/https?:\/\/[^\s\]]+/);
  if (plainMatch) return plainMatch[0];
  return str.trim();
}

// P1 parsing
const p1Lines = part1.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
const p1DataLines = p1Lines.filter(l => 
  !l.startsWith('<USER_REQUEST>') && 
  !l.startsWith('</USER_REQUEST>') && 
  !l.startsWith('lalu ini letakkan') && 
  l !== 'Term' && 
  l !== 'Link Term'
);

const p1Counts = {};
const p1Records = [];
let i = 0;
while (i < p1DataLines.length) {
  const trainee_id = p1DataLines[i];
  const term = p1DataLines[i+1];
  const link_term_raw = p1DataLines[i+2];

  if (trainee_id && term && link_term_raw && (link_term_raw.includes('drive.google.com') || link_term_raw.includes('http'))) {
    p1Counts[trainee_id] = (p1Counts[trainee_id] || 0) + 1;
    p1Records.push({ trainee_id, term, link_term: cleanUrl(link_term_raw) });
    i += 3;
  } else {
    i++;
  }
}

// P2 parsing
const p2Lines = part2.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
const p2DataLines = p2Lines.filter(l => 
  !l.startsWith('Trainee_id') && 
  !l.startsWith('Nama') && 
  !l.startsWith('Link YT') &&
  !l.startsWith('</USER_REQUEST>') &&
  !l.startsWith('<truncated') &&
  !l.startsWith('NOTE:')
);

const p2Counts = {};
const p2Records = [];
let j = 0;
while (j < p2DataLines.length) {
  const line1 = p2DataLines[j];
  const line2 = p2DataLines[j+1];
  const line3 = p2DataLines[j+2];

  if (line3 && (line3.includes('youtube.com') || line3.includes('youtu.be') || line3.includes('http'))) {
    p2Counts[line1] = (p2Counts[line1] || 0) + 1;
    p2Records.push({ trainee_id: line1, nama: line2, link_youtube: cleanUrl(line3) });
    j += 3;
  } else if (line2 && (line2.includes('youtube.com') || line2.includes('youtu.be') || line2.includes('http'))) {
    p2Counts[line1] = (p2Counts[line1] || 0) + 1;
    p2Records.push({ trainee_id: line1, nama: '', link_youtube: cleanUrl(line2) });
    j += 2;
  } else if (line1 && /^\d+$/.test(line1) && line2 && !line2.includes('http')) {
    p2Counts[line1] = (p2Counts[line1] || 0) + 1;
    p2Records.push({ trainee_id: line1, nama: line2, link_youtube: null });
    j += 2;
  } else {
    j++;
  }
}

const p1Dupes = Object.entries(p1Counts).filter(([id, c]) => c > 1);
const p2Dupes = Object.entries(p2Counts).filter(([id, c]) => c > 1);

console.log('P1 Total Records:', p1Records.length);
console.log('P1 Duplicates count:', p1Dupes.length);
if (p1Dupes.length > 0) console.log('P1 Dupes sample:', p1Dupes.slice(0, 5));

console.log('\nP2 Total Records:', p2Records.length);
console.log('P2 Duplicates count:', p2Dupes.length);
if (p2Dupes.length > 0) console.log('P2 Dupes sample:', p2Dupes.slice(0, 5));
