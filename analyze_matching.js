const fs = require('fs');

const { p1Records, p2Records } = parseAll();

function cleanUrl(str) {
  if (!str) return '';
  const match = str.match(/\((https?:\/\/[^\)]+)\)/);
  if (match) return match[1];
  const plainMatch = str.match(/https?:\/\/[^\s\]]+/);
  if (plainMatch) return plainMatch[0];
  return str.trim();
}

function parseAll() {
  const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

  const parts = raw.split(/ini juga ya letakkan di tabel link_report/i);
  const part1 = parts[0];
  const part2 = parts[1] || '';

  // Parse Part 1
  const p1Lines = part1.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const p1DataLines = p1Lines.filter(l => 
    !l.startsWith('<USER_REQUEST>') && 
    !l.startsWith('</USER_REQUEST>') && 
    !l.startsWith('lalu ini letakkan') && 
    l !== 'Term' && 
    l !== 'Link Term'
  );

  const p1Records = [];
  let i = 0;
  while (i < p1DataLines.length) {
    const trainee_id = p1DataLines[i];
    const term = p1DataLines[i+1];
    const link_term_raw = p1DataLines[i+2];

    if (trainee_id && term && link_term_raw && (link_term_raw.includes('drive.google.com') || link_term_raw.includes('http'))) {
      p1Records.push({
        trainee_id,
        term,
        link_term: cleanUrl(link_term_raw)
      });
      i += 3;
    } else {
      i++;
    }
  }

  // Parse Part 2
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
      p2Records.push({
        trainee_id: line1,
        nama: line2,
        link_youtube: cleanUrl(line3)
      });
      j += 3;
    } else if (line2 && (line2.includes('youtube.com') || line2.includes('youtu.be') || line2.includes('http'))) {
      p2Records.push({
        trainee_id: line1,
        nama: '',
        link_youtube: cleanUrl(line2)
      });
      j += 2;
    } else if (line1 && /^\d+$/.test(line1) && line2 && !line2.includes('http')) {
      // missing link
      p2Records.push({
        trainee_id: line1,
        nama: line2,
        link_youtube: null
      });
      j += 2;
    } else {
      j++;
    }
  }

  return { p1Records, p2Records };
}

const p1Map = new Map();
p1Records.forEach(r => p1Map.set(r.trainee_id, r));

const p2Map = new Map();
p2Records.forEach(r => p2Map.set(r.trainee_id, r));

console.log('P1 Total Unique Trainee IDs:', p1Map.size);
console.log('P2 Total Unique Trainee IDs:', p2Map.size);

// Combine all trainee_ids
const allTraineeIds = new Set([...p1Map.keys(), ...p2Map.keys()]);
console.log('Total Combined Trainee IDs:', allTraineeIds.size);

let inBoth = 0;
let onlyP1 = 0;
let onlyP2 = 0;

for (let tid of allTraineeIds) {
  if (p1Map.has(tid) && p2Map.has(tid)) inBoth++;
  else if (p1Map.has(tid)) onlyP1++;
  else if (p2Map.has(tid)) onlyP2++;
}

console.log('In both P1 and P2:', inBoth);
console.log('Only in P1:', onlyP1);
console.log('Only in P2:', onlyP2);
