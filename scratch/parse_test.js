const fs = require('fs');
const path = require('path');

function parseData() {
  const filePath = path.join(__dirname, 'monthly_gold_data.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  console.log('Total lines read:', lines.length);

  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Columns are tab-separated
    const cols = line.split('\t');
    if (cols.length < 2) {
      console.warn(`Line ${i+1} has less than 2 columns: "${line}"`);
      continue;
    }

    parsed.push({
      id: cols[0] ? cols[0].trim() : '',
      name: cols[1] ? cols[1].trim() : '',
      status: cols[2] ? cols[2].trim() : '',
      level: cols[3] ? cols[3].trim() : '',
      house: cols[4] ? cols[4].trim() : null,
      class: cols[5] ? cols[5].trim() : null,
      branch: cols[6] ? cols[6].trim() : null,
      total_gold: cols[7] ? cols[7].trim() : '0',
      junior_youth: cols[8] ? cols[8].trim() : null,
      rank_junior: cols[9] ? cols[9].trim() : null,
      rank_youth: cols[10] ? cols[10].trim() : null,
      rank_junior_timor: cols[11] ? cols[11].trim() : null,
      rank_youth_timor: cols[12] ? cols[12].trim() : null,
      rank_junior_tritura: cols[13] ? cols[13].trim() : null,
      rank_youth_tritura: cols[14] ? cols[14].trim() : null,
      rank_junior_cemara: cols[15] ? cols[15].trim() : null,
      rank_youth_cemara: cols[16] ? cols[16].trim() : null,
    });
  }

  console.log('Sample parsed data (first 3 rows):');
  console.log(JSON.stringify(parsed.slice(0, 3), null, 2));
  console.log('Sample parsed data (last 3 rows):');
  console.log(JSON.stringify(parsed.slice(-3), null, 2));
}

parseData();
