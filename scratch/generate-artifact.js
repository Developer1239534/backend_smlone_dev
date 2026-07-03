const fs = require('fs');
const path = require('path');

const resultsJsonPath = path.join(__dirname, 'user_requested_ids_result.json');
const artifactDir = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17';
const outputPath = path.join(artifactDir, 'screening_test_results.md');

function main() {
  if (!fs.existsSync(resultsJsonPath)) {
    console.error('Results JSON not found!');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));

  let markdown = `# Laporan Pengecekan Link Screening Test\n\n`;
  markdown += `Berikut adalah laporan pengecekan link *Screening Test* untuk ID trainee yang Anda minta. Pemeriksaan ini mencakup status keberadaan link di database serta nama file/folder Google Drive tujuan untuk mencocokkan isinya.\n\n`;
  
  // Summary counts
  const total = results.length;
  const withLink = results.filter(r => r.url !== '-').length;
  const withoutLink = total - withLink;

  markdown += `### Ringkasan Status:\n`;
  markdown += `* **Total ID Diperiksa:** ${total}\n`;
  markdown += `* **Sudah Ada Link:** ${withLink} trainee\n`;
  markdown += `* **Belum Ada Link (Kosong):** ${withoutLink} trainee\n\n`;

  markdown += `> [!NOTE]\n`;
  markdown += `> Link yang sebelumnya terdeteksi **mismatch** (ID dan nama file berbeda jauh, misalnya file milik siswa lain) telah kami bersihkan (dikosongkan/set NULL) di database untuk menjaga akurasi data.\n\n`;

  markdown += `## Tabel Hasil Pemeriksaan\n\n`;
  markdown += `| ID | Nama Trainee | Status | Isi Laporan (Judul File/Folder Google Drive) | Link Google Drive |\n`;
  markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

  for (const r of results) {
    const status = r.url !== '-' ? '✅ Ada Link' : '❌ Kosong';
    let docTitle = r.title;
    if (docTitle.endsWith(' - Google Drive')) {
      docTitle = docTitle.substring(0, docTitle.length - ' - Google Drive'.length);
    }
    
    const linkStr = r.url !== '-' ? `[Buka Link](${r.url})` : '-';
    markdown += `| ${r.id} | ${r.name} | ${status} | ${docTitle} | ${linkStr} |\n`;
  }

  fs.writeFileSync(outputPath, markdown, 'utf8');
  console.log(`Artifact successfully written to: ${outputPath}`);
  process.exit(0);
}

main();
