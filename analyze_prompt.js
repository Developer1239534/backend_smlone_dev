const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

console.log('Total characters:', raw.length);

// Split sections if there are markers or keywords
const parts = raw.split(/ini juga ya letakkan di tabel link_report/i);
console.log('Number of parts:', parts.length);

// Part 1: Term / Drive links
const part1 = parts[0];
// Part 2: YT links
const part2 = parts[1] || '';

console.log('Part 1 length:', part1.length);
console.log('Part 2 length:', part2.length);

// Let's analyze line structure in Part 1
const p1Lines = part1.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
console.log('Part 1 non-empty lines count:', p1Lines.length);
console.log('Sample P1 lines:', p1Lines.slice(0, 15));

// Let's analyze line structure in Part 2
const p2Lines = part2.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
console.log('Part 2 non-empty lines count:', p2Lines.length);
console.log('Sample P2 lines:', p2Lines.slice(0, 15));
