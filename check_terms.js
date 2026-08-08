const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

const parts = raw.split(/ini juga ya letakkan di tabel link_report/i);
const part1 = parts[0];

const p1Lines = part1.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
const p1DataLines = p1Lines.filter(l => 
  !l.startsWith('<USER_REQUEST>') && 
  !l.startsWith('</USER_REQUEST>') && 
  !l.startsWith('lalu ini letakkan') && 
  l !== 'Term' && 
  l !== 'Link Term'
);

const terms = new Set();
let i = 0;
while (i < p1DataLines.length) {
  const trainee_id = p1DataLines[i];
  const term = p1DataLines[i+1];
  const link_term = p1DataLines[i+2];

  if (trainee_id && term && link_term && link_term.includes('http')) {
    terms.add(term);
    i += 3;
  } else {
    i++;
  }
}

console.log('Unique terms in Part 1:', Array.from(terms));
