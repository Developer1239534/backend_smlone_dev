const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-real-stages.txt');

async function main() {
  try {
    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('ID\t') || lines[i].includes('ID ')) {
        headerIndex = i;
        break;
      }
    }

    let headerLine = lines[headerIndex];
    const idIdx = headerLine.indexOf('ID');
    if (idIdx > 0) {
      headerLine = headerLine.substring(idIdx);
    }
    const headerCols = headerLine.split('\t').map(c => c.trim());
    let idCol = 0;
    headerCols.forEach((col, idx) => {
      if (col.toLowerCase() === 'id') idCol = idx;
    });

    const fileIds = new Set();
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('</USER_REQUEST>') || line.startsWith('<ADDITIONAL_METADATA>') || line.startsWith('</ADDITIONAL_METADATA>')) continue;

      const parts = lines[i].split('\t').map(p => p.trim());
      if (parts.length <= idCol) continue;

      let id = parts[idCol];
      if (!id || isNaN(id)) continue;
      if (id === '968') id = '966';
      fileIds.add(id);
    }

    console.log(`Parsed ${fileIds.size} unique trainee IDs from user file.`);

    const dbRes = await db.query('SELECT id, trainee_name FROM dashboard_trainne');
    const dbIds = new Set(dbRes.rows.map(r => r.id));

    const missing = [];
    for (const fid of fileIds) {
      if (!dbIds.has(fid)) {
        missing.push(fid);
      }
    }

    console.log(`Found ${missing.length} trainee IDs from the file that do NOT exist in the database:`);
    console.log(missing);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
