const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'full-user-prompt-2025-may-dec.txt');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const periods = {};
let dataLines = 0;

for (const line of lines) {
  const parts = line.split('\t');
  if (parts.length >= 2) {
    const id = parts[0].trim();
    const period = parts[1].trim();
    if (!isNaN(id) && id !== '') {
      periods[period] = (periods[period] || 0) + 1;
      dataLines++;
    }
  }
}

console.log('Total data lines:', dataLines);
console.log('Counts per period:', periods);
