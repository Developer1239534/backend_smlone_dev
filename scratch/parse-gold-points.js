const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'latest-user-request-gold-points.txt');

async function main() {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const headerLine = lines[8]; // Line 9 (0-indexed 8)
  const headerCols = headerLine.split('\t').map(c => c.trim());
  
  const idIndices = [];
  headerCols.forEach((col, idx) => {
    if (col === 'ID') {
      idIndices.push(idx);
    }
  });

  const tables = [
    { name: 'rank_id_junior', startCol: idIndices[0] },
    { name: 'rank_id_youth', startCol: idIndices[1] },
    { name: 'rank_id_junior_timor', startCol: idIndices[2] },
    { name: 'rank_id_youth_timor', startCol: idIndices[3] },
    { name: 'rank_id_junior_tritura', startCol: idIndices[4] },
    { name: 'rank_id_youth_tritura', startCol: idIndices[5] },
    { name: 'rank_id_junior_cemara', startCol: idIndices[6] },
    { name: 'rank_id_youth_cemara', startCol: idIndices[7] }
  ];

  // Map each table's columns
  tables.forEach((t, index) => {
    const nextStart = idIndices[index + 1] || headerCols.length;
    
    // Find Nama Trainee column
    let nameOffset = 1;
    let goldOffset = 7;
    let rankOffset = 9;

    for (let c = t.startCol; c < nextStart; c++) {
      const h = headerCols[c];
      if (h === 'Nama Trainee') nameOffset = c - t.startCol;
      if (h === 'Total Gold/Periode') goldOffset = c - t.startCol;
      if (h === 'RANK/ID') rankOffset = c - t.startCol;
    }

    t.nameOffset = nameOffset;
    t.goldOffset = goldOffset;
    t.rankOffset = rankOffset;
    t.endCol = nextStart;
  });

  console.log('Table configurations:', tables);

  const traineeMap = {};

  // Parse lines starting from 9 (0-indexed 9)
  for (let i = 9; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check if it's metadata or tags
    if (
      line.startsWith('<USER_REQUEST>') || 
      line.startsWith('</USER_REQUEST>') || 
      line.startsWith('<ADDITIONAL_METADATA>') ||
      line.startsWith('</ADDITIONAL_METADATA>') ||
      line.includes('jika ada ID tidak ada') ||
      line.includes('The current local time is') ||
      line.includes('NOTE: The output was truncated') ||
      line.includes('<truncated')
    ) {
      continue;
    }

    const cols = line.split('\t');
    
    // Parse each of the 8 tables on this line
    tables.forEach(t => {
      if (t.startCol >= cols.length) return;
      const id = cols[t.startCol] ? cols[t.startCol].trim() : '';
      if (!id || isNaN(id)) return; // No valid trainee ID in this table on this row

      const nameCol = t.startCol + t.nameOffset;
      const goldCol = t.startCol + t.goldOffset;
      const rankCol = t.startCol + t.rankOffset;

      const name = cols[nameCol] ? cols[nameCol].trim() : '';
      const gold = cols[goldCol] ? cols[goldCol].trim() : '';
      const rank = cols[rankCol] ? cols[rankCol].trim() : '';

      if (!traineeMap[id]) {
        traineeMap[id] = {
          id,
          name,
          total_gold_periode: gold,
          ranks: {}
        };
      } else {
        // If gold points are different, we can take the maximum or warn
        if (gold && (!traineeMap[id].total_gold_periode || Number(gold) > Number(traineeMap[id].total_gold_periode))) {
          traineeMap[id].total_gold_periode = gold;
        }
      }

      if (rank) {
        traineeMap[id].ranks[t.name] = rank;
      }
    });
  }

  console.log(`Parsed ${Object.keys(traineeMap).length} unique trainees.`);
  
  // Print first 5 parsed trainees
  const keys = Object.keys(traineeMap);
  console.log('Sample parsed trainees:');
  for (let i = 0; i < Math.min(10, keys.length); i++) {
    console.log(traineeMap[keys[i]]);
  }
}

main();
