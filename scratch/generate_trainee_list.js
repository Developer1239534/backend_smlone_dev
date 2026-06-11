require('dotenv').config();
const db = require('../src/db/neonClient');
const fs = require('fs');
const path = require('path');

const ARTIFACT_PATH = 'C:/Users/ASUS ROG/.gemini/antigravity/brain/faa8c175-a20d-47af-af0e-98a66846f5d4/trainee_list.md';

(async () => {
  try {
    console.log('🔄 Fetching trainees from database...');
    const result = await db.query('SELECT id, trainee_name FROM dashboard_trainne ORDER BY id ASC');
    console.log(`✅ Fetched ${result.rows.length} trainees.`);

    let md = `# Trainee List (SMLONE)\n\n`;
    md += `Total Trainee: **${result.rows.length}**\n\n`;
    md += `| ID Trainee | Nama Trainee |\n`;
    md += `| :--- | :--- |\n`;

    for (const row of result.rows) {
      md += `| ${row.id} | ${row.trainee_name} |\n`;
    }

    // Ensure the folder exists
    const dir = path.dirname(ARTIFACT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(ARTIFACT_PATH, md, 'utf8');
    console.log('✅ Trainee list artifact generated successfully!');
  } catch (err) {
    console.error('❌ Error generating trainee list:', err.message);
  } finally {
    await db.pool.end();
  }
})();
