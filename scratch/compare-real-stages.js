const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-real-stages.txt');

async function main() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ Data file not found at: ${dataFilePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('ID\t') || lines[i].includes('ID ')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      console.error('❌ Could not find header line starting with ID');
      process.exit(1);
    }

    let headerLine = lines[headerIndex];
    const idIdx = headerLine.indexOf('ID');
    if (idIdx > 0) {
      headerLine = headerLine.substring(idIdx);
    }
    console.log(`Found header line: "${headerLine}"`);
    const headerCols = headerLine.split('\t').map(c => c.trim());
    let idCol = 0, periodCol = 1, urlCol = 2;
    headerCols.forEach((col, idx) => {
      if (col.toLowerCase() === 'id') idCol = idx;
      if (col.toLowerCase().includes('periode')) periodCol = idx;
      if (col.toLowerCase().includes('report') || col.toLowerCase().includes('link')) urlCol = idx;
    });

    const fileMap = {};
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('</USER_REQUEST>') || line.startsWith('<ADDITIONAL_METADATA>') || line.startsWith('</ADDITIONAL_METADATA>')) continue;

      const parts = lines[i].split('\t').map(p => p.trim());
      if (parts.length <= Math.max(idCol, periodCol)) continue;

      let id = parts[idCol];
      const periode = parts[periodCol];
      const url = parts[urlCol] || null;

      if (!id || isNaN(id) || !periode) continue;
      if (id === '968') id = '966';

      const key = `${id}|||${periode}`;
      fileMap[key] = (url && url !== '-') ? url : null;
    }

    // Get all records from database
    const dbRes = await db.query('SELECT trainee_id, periode, url FROM real_stage');
    const dbMap = {};
    for (const r of dbRes.rows) {
      const key = `${r.trainee_id}|||${r.periode}`;
      dbMap[key] = r.url;
    }

    console.log('--- COMPARING FILE vs DATABASE ---');
    let diffCount = 0;
    const fileKeys = Object.keys(fileMap);

    for (const key of fileKeys) {
      const fileUrl = fileMap[key];
      const dbUrl = dbMap[key];

      if (dbUrl === undefined) {
        console.log(`[NEW RECORD] Key: ${key}`);
        console.log(`  File URL: ${fileUrl}`);
        diffCount++;
      } else if (fileUrl !== dbUrl) {
        console.log(`[CHANGED URL] Key: ${key}`);
        console.log(`  DB URL:   ${dbUrl}`);
        console.log(`  File URL: ${fileUrl}`);
        diffCount++;
      }
    }

    // Check for deleted keys
    const dbKeys = Object.keys(dbMap);
    for (const key of dbKeys) {
      if (fileMap[key] === undefined) {
        // Only print if period is one of the synced ones
        if (key.includes('Real Stage 38') || key.includes('Real Stage 39') || key.includes('Real Stage 40') || key.includes('Real Stage 41') || key.includes('Real Stage 42') || key.includes('Real Stage 43') || key.includes('Real Stage 44') || key.includes('Real Stage 45') || key.includes('Real Stage 46') || key.includes('Real Stage 47') || key.includes('Real Stage 48') || key.includes('Real Stage 49')) {
          console.log(`[DELETED IN FILE] Key: ${key}`);
          console.log(`  DB URL: ${dbMap[key]}`);
          diffCount++;
        }
      }
    }

    console.log(`\nComparison finished. Found ${diffCount} differences.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
