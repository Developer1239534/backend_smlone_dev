const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  try {
    const rawPath = path.join(__dirname, 'speaking_table_raw.txt');
    if (!fs.existsSync(rawPath)) {
      console.error('speaking_table_raw.txt not found.');
      process.exit(1);
    }

    const content = fs.readFileSync(rawPath, 'utf8');
    const lines = content.trim().split('\n');
    
    const speakingIdsSet = new Set();
    const speakingTraineesMap = new Map();

    for (const line of lines) {
      const parts = line.trim().split(/\t/);
      let id = null;
      let name = null;
      
      if (parts.length >= 2) {
        id = parts[0].trim();
        name = parts[1].trim();
      } else {
        const tokens = line.trim().split(/\s+/);
        if (tokens.length >= 2) {
          id = tokens[0];
          name = tokens.slice(1).join(' ');
        }
      }

      if (id && /^\d+$/.test(id)) {
        speakingIdsSet.add(id);
        speakingTraineesMap.set(id, name);
      }
    }

    console.log(`Parsed ${speakingIdsSet.size} unique trainee IDs from the user's list.`);

    // Query database for all these IDs
    const speakingIdsArray = Array.from(speakingIdsSet);
    
    // We want to find which of these IDs do NOT have a real stage link
    const queryStr = `
      SELECT dt.id, dt.trainee_name, dt.status
      FROM dashboard_trainne dt
      WHERE dt.id = ANY($1)
        AND NOT EXISTS (
          SELECT 1 
          FROM real_stage rs 
          WHERE rs.trainee_id = dt.id 
            AND rs.url IS NOT NULL 
            AND rs.url != '' 
            AND rs.url LIKE 'http%'
        )
      ORDER BY CASE WHEN dt.id ~ '^[0-9]+$' THEN dt.id::bigint ELSE 9999999999 END, dt.id
    `;
    
    const res = await db.query(queryStr, [speakingIdsArray]);
    console.log(`Found ${res.rows.length} trainees from the speaking list who do not have a valid Real Stage link.`);

    // Write the output report as an artifact
    let markdown = `# Trainees from Speaking List Missing Real Stage Links (${res.rows.length})\n\n`;
    markdown += `Berikut adalah daftar ${res.rows.length} trainee dari list yang Anda berikan (untuk Speaking Project) yang **belum memiliki link Real Stage** di database.\n\n`;
    markdown += `| ID Trainee | Nama (Dari List) | Nama (Di DB) | Status |\n`;
    markdown += `| :--- | :--- | :--- | :--- |\n`;
    
    for (const row of res.rows) {
      const listName = speakingTraineesMap.get(row.id) || 'N/A';
      markdown += `| ${row.id} | ${listName} | ${row.trainee_name || 'N/A'} | ${row.status || 'N/A'} |\n`;
    }
    
    const outputPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\speaking_list_missing_real_stage.md';
    fs.writeFileSync(outputPath, markdown, 'utf8');
    console.log(`Report written to: ${outputPath}`);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
