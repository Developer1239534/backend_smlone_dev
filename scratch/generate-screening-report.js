const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(
      'SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE screening_test IS NOT NULL ORDER BY id ASC'
    );
    const trainees = res.rows;
    console.log(`Generating report for ${trainees.length} trainees...`);

    let md = `# Mapped Screening Test Links in Database\n\n`;
    md += `Berikut adalah daftar seluruh trainee yang saat ini memiliki link *Screening Test* aktif di database backend.\n\n`;
    md += `**Total Mapped:** ${trainees.length} trainee\n\n`;
    md += `| ID | Nama Trainee | Link Google Drive |\n`;
    md += `| :--- | :--- | :--- |\n`;

    trainees.forEach(t => {
      md += `| ${t.id} | ${t.trainee_name} | [Buka Link](${t.screening_test}) |\n`;
    });

    const reportPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\screening_test_links_in_db.md';
    fs.writeFileSync(reportPath, md, 'utf8');
    console.log(`Report successfully written to ${reportPath}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
