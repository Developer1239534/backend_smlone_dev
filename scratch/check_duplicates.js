const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function checkDuplicates() {
  try {
    console.log('=== 1. CHECKING DUPLICATES IN RAW FILE (june_data.txt) ===');
    const filePath = path.join(__dirname, 'june_data.txt');
    if (!fs.existsSync(filePath)) {
      console.error('File not found at:', filePath);
    } else {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      
      let headerIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('ID\t') || lines[i].startsWith('ID ')) {
          headerIndex = i;
          break;
        }
      }

      const idCounts = {};
      const nameCounts = {};
      let lineNum = headerIndex + 2;

      for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = lines[i].split('\t').map(c => c.trim());
        if (cols.length < 2 || !cols[0]) continue;

        const id = cols[0];
        const name = cols[1];

        idCounts[id] = (idCounts[id] || 0) + 1;
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      }

      const duplicateIdsInFile = Object.entries(idCounts).filter(([id, count]) => count > 1);
      const duplicateNamesInFile = Object.entries(nameCounts).filter(([name, count]) => count > 1);

      console.log('Duplicate IDs in raw file:', duplicateIdsInFile);
      console.log('Duplicate Trainee Names in raw file:', duplicateNamesInFile);
    }

    console.log('\n=== 2. CHECKING DUPLICATES IN DATABASE TABLE (dashboard_trainne) ===');
    // Check if any ID appears more than once (should be 0 since ID is PRIMARY KEY)
    const dbIdResult = await db.query(`
      SELECT id, COUNT(*) 
      FROM dashboard_trainne 
      GROUP BY id 
      HAVING COUNT(*) > 1;
    `);
    console.log('Duplicate IDs in Database:', dbIdResult.rows);

    // Check if any Trainee Name appears more than once
    const dbNameResult = await db.query(`
      SELECT trainee_name, COUNT(*), ARRAY_AGG(id) as ids
      FROM dashboard_trainne 
      GROUP BY trainee_name 
      HAVING COUNT(*) > 1;
    `);
    console.log('Duplicate Trainee Names in Database (same name, different IDs):', dbNameResult.rows.length);
    if (dbNameResult.rows.length > 0) {
      console.log('Duplicate Trainee Names found in DB:', dbNameResult.rows);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkDuplicates();
