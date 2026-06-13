const fs = require('fs');
const path = require('path');

function checkFileDuplicates() {
  const filePath = path.join(__dirname, 'monthly_gold_data.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const ids = {};
  const names = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split('\t');
    const id = cols[0] ? cols[0].trim() : '';
    const name = cols[1] ? cols[1].trim() : '';

    if (id) {
      ids[id] = (ids[id] || 0) + 1;
    }
    if (name) {
      names[name] = (names[name] || 0) + 1;
    }
  }

  const dupIds = Object.entries(ids).filter(([k, v]) => v > 1);
  const dupNames = Object.entries(names).filter(([k, v]) => v > 1);

  console.log('Duplicate IDs in file:', dupIds);
  console.log('Duplicate names in file:', dupNames);
}

checkFileDuplicates();
