const fs = require('fs');
const path = require('path');

function parseTermData() {
  const content = fs.readFileSync(path.join(__dirname, 'raw_term_data.txt'), 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('link term')) {
      startIdx = i + 1;
      break;
    }
  }

  const dataLines = lines.slice(startIdx);
  const records = [];

  let i = 0;
  while (i < dataLines.length) {
    const candidateId = dataLines[i];
    if (/^\d+$/.test(candidateId)) {
      const id = candidateId;
      let title2 = '';
      let linkTerm = '';

      if (i + 1 < dataLines.length) {
        title2 = dataLines[i + 1];
      }
      if (i + 2 < dataLines.length) {
        linkTerm = dataLines[i + 2];
      }

      let cleanLink = linkTerm;
      const match = linkTerm.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        cleanLink = match[2] || match[1];
      } else if (linkTerm.startsWith('http')) {
        cleanLink = linkTerm;
      }

      if (/^\d+$/.test(title2)) {
        // title2 is next ID
        records.push({ id, report_title_2: '', link_term: '' });
        i += 1;
      } else if (/^\d+$/.test(linkTerm)) {
        // linkTerm is next ID
        records.push({ id, report_title_2: title2, link_term: '' });
        i += 2;
      } else {
        records.push({ id, report_title_2: title2, link_term: cleanLink });
        i += 3;
      }
    } else {
      i++;
    }
  }

  console.log(`Parsed ${records.length} term records.`);
  
  // Count unique IDs
  const idMap = new Map();
  records.forEach(r => {
    if (!idMap.has(r.id)) idMap.set(r.id, []);
    idMap.get(r.id).push(r);
  });

  console.log(`Unique Trainee IDs in term data: ${idMap.size}`);

  // Print sample records
  console.log('Sample parsed term records:', records.slice(0, 5));
}

parseTermData();
