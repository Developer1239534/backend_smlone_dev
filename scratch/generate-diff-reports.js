const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const reportPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\screening_test_results.md';

async function main() {
  try {
    if (!fs.existsSync(reportPath)) {
      console.error('Original report not found.');
      process.exit(1);
    }

    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.trim().split('\n');

    const originalEmpty = [];
    for (const line of lines) {
      if (line.startsWith('|') && !line.includes('ID | Nama Trainee') && !line.includes(':---')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          const id = parts[1];
          const name = parts[2];
          const status = parts[3];
          if (status.includes('Kosong')) {
            originalEmpty.push({ id, name });
          }
        }
      }
    }

    const res = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne ORDER BY id ASC');
    const dbTrainees = res.rows;

    const newlyMatched = [];
    const stillEmpty = [];

    dbTrainees.forEach(t => {
      const originallyWasEmpty = originalEmpty.some(oe => oe.id === t.id);
      if (t.screening_test) {
        if (originallyWasEmpty) {
          newlyMatched.push(t);
        }
      } else {
        stillEmpty.push(t);
      }
    });

    // 1. Write Newly Matched Report
    let mdMatched = `# Newly Matched Trainees (182)\n\n`;
    mdMatched += `Berikut adalah daftar 182 trainee yang sebelumnya **Kosong** namun sekarang telah **Berhasil dicocokkan dan diperbarui** di database.\n\n`;
    mdMatched += `| ID Trainee | Nama Trainee | Link Google Drive Mapped |\n`;
    mdMatched += `| :--- | :--- | :--- |\n`;
    newlyMatched.forEach(t => {
      mdMatched += `| ${t.id} | ${t.trainee_name} | [Buka Link](${t.screening_test}) |\n`;
    });
    fs.writeFileSync(
      'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\newly_matched_trainees.md',
      mdMatched,
      'utf8'
    );

    // 2. Write Still Empty Report
    let mdEmpty = `# Trainees Still Missing Links (365)\n\n`;
    mdEmpty += `Berikut adalah daftar 365 trainee yang **masih belum memiliki link** Screening Test di database backend.\n\n`;
    mdEmpty += `| ID Trainee | Nama Trainee | Status |\n`;
    mdEmpty += `| :--- | :--- | :--- |\n`;
    stillEmpty.forEach(t => {
      mdEmpty += `| ${t.id} | ${t.trainee_name} | ❌ Kosong |\n`;
    });
    fs.writeFileSync(
      'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\trainees_still_missing_links.md',
      mdEmpty,
      'utf8'
    );

    console.log('Successfully generated diff reports.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
