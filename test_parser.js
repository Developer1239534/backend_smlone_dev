const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

const parts = raw.split(/ini juga ya letakkan di tabel link_report/i);
const part1 = parts[0];
const part2 = parts[1] || '';

function cleanUrl(str) {
  if (!str) return '';
  // Check if markdown link [text](url)
  const match = str.match(/\((https?:\/\/[^\)]+)\)/);
  if (match) return match[1];
  // Check if plain url
  const plainMatch = str.match(/https?:\/\/[^\s\]]+/);
  if (plainMatch) return plainMatch[0];
  return str.trim();
}

// Parse Part 1: Term / Drive links
const p1Lines = part1.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

// Filter out header text
const p1DataLines = p1Lines.filter(l => 
  !l.startsWith('<USER_REQUEST>') && 
  !l.startsWith('</USER_REQUEST>') && 
  !l.startsWith('lalu ini letakkan') && 
  l !== 'Term' && 
  l !== 'Link Term'
);

console.log('Filtered P1 lines count:', p1DataLines.length);

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
    console.log('P1 Anomaly at index', i, ':', p1DataLines.slice(i, i + 5));
    i++;
  }
}

console.log('Parsed P1 records count:', p1Records.length);
if (p1Records.length > 0) {
  console.log('First P1 record:', p1Records[0]);
  console.log('Last P1 record:', p1Records[p1Records.length - 1]);
}

// Parse Part 2: YT links
const p2Lines = part2.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
const p2DataLines = p2Lines.filter(l => 
  !l.startsWith('Trainee_id') && 
  !l.startsWith('Nama') && 
  !l.startsWith('Link YT') &&
  !l.startsWith('</USER_REQUEST>')
);

console.log('\nFiltered P2 lines count:', p2DataLines.length);

const p2Records = [];
let j = 0;
while (j < p2DataLines.length) {
  const line1 = p2DataLines[j];
  const line2 = p2DataLines[j+1];
  const line3 = p2DataLines[j+2];

  // check if line1 is trainee_id (usually numeric string like 70100019 or 602 etc)
  // line3 might be link or line2 might be link or missing link
  if (line3 && (line3.includes('youtube.com') || line3.includes('youtu.be') || line3.includes('http'))) {
    p2Records.push({
      trainee_id: line1,
      nama: line2,
      link_youtube: cleanUrl(line3)
    });
    j += 3;
  } else if (line2 && (line2.includes('youtube.com') || line2.includes('youtu.be') || line2.includes('http'))) {
    // maybe no name provided
    p2Records.push({
      trainee_id: line1,
      nama: '',
      link_youtube: cleanUrl(line2)
    });
    j += 2;
  } else if (line1 && /^\d+$/.test(line1) && line2 && !line2.includes('http')) {
    // missing link for this trainee_id
    console.log('P2 Missing YT link for trainee:', line1, line2);
    j += 2;
  } else {
    console.log('P2 Anomaly at index', j, ':', p2DataLines.slice(j, j + 5));
    j++;
  }
}

console.log('Parsed P2 records count:', p2Records.length);
if (p2Records.length > 0) {
  console.log('First P2 record:', p2Records[0]);
  console.log('Last P2 record:', p2Records[p2Records.length - 1]);
}
