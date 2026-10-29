/**
 * Job sinkronisasi data dari tab Google Sheet "Level 6 Links"
 * Spreadsheet: 1Ed60KEQ5gWeKMZcUSs2sPlW7Ua4qruwhjyKf_cclooI (Level 2 - Report Link)
 * Tab: Level 6 Links (GID: 1893475080)
 * Target Table: student_level6_reports
 */

const https = require('https');
const db = require('../db/mysqlClient');

const SPREADSHEET_ID = '1Ed60KEQ5gWeKMZcUSs2sPlW7Ua4qruwhjyKf_cclooI';
const GID = '1893475080';

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchCsv(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCsv(text) {
  const lines = text.split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const matches = [];
    const re = /(?:^|,)(?:"((?:[^"]|"")*)"|([^,]*))/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      matches.push(m[1] !== undefined ? m[1].replace(/""/g, '"') : m[2]);
    }
    rows.push(matches);
  }
  return rows;
}

async function syncLevel6Links() {
  console.log('🔄 Memulai sinkronisasi Level 6 Links dari Google Sheet...');
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;
  
  try {
    const csvData = await fetchCsv(url);
    const rows = parseCsv(csvData);
    console.log(`📊 Total baris mentah di sheet: ${rows.length}`);

    // Filter baris valid: Kolom A = Report Type, Kolom B = ID (integer), Kolom C = Report Title, Kolom E = Link to Report
    const validItems = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 5) continue;

      const reportType = (r[0] || '').trim();
      const rawId = (r[1] || '').trim();
      const reportTitle = (r[2] || '').trim();
      const reportLink = (r[4] || '').trim();

      const studentId = parseInt(rawId, 10);
      if (isNaN(studentId) || studentId <= 0) continue;
      if (!reportLink || reportLink === '-' || reportLink.toLowerCase() === 'none') continue;

      validItems.push({
        student_id: studentId,
        report_type: reportType,
        report_title: reportTitle,
        report_link: reportLink
      });
    }

    console.log(`✅ Total item valid yang akan disinkronkan: ${validItems.length}`);

    // Dapatkan data yang sudah ada di DB untuk menghindari duplikasi
    const existingRes = await db.query('SELECT student_id, report_title, report_link FROM student_level6_reports');
    const existingSet = new Set(
      (existingRes.rows || []).map(e => `${e.student_id}|${e.report_title}|${e.report_link}`)
    );

    let insertedCount = 0;
    const batchSize = 200;
    let batch = [];

    for (const item of validItems) {
      const key = `${item.student_id}|${item.report_title}|${item.report_link}`;
      if (existingSet.has(key)) continue;

      existingSet.add(key); // Tandai agar tidak ganda dalam sheet itu sendiri
      batch.push([item.student_id, item.report_type, item.report_title, item.report_link]);

      if (batch.length >= batchSize) {
        await insertBatch(batch);
        insertedCount += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await insertBatch(batch);
      insertedCount += batch.length;
    }

    console.log(`🎉 Selesai! Berhasil menambahkan ${insertedCount} entri baru ke student_level6_reports (Zero Duplicate).`);
    return { success: true, insertedCount, totalValid: validItems.length };
  } catch (err) {
    console.error('❌ Gagal sinkronisasi Level 6 Links:', err);
    throw err;
  }
}

async function insertBatch(items) {
  if (items.length === 0) return;
  const placeholders = items.map(() => '(?, ?, ?, ?, NOW(), NOW())').join(', ');
  const flatValues = items.flat();
  const sql = `
    INSERT INTO student_level6_reports (student_id, report_type, report_title, report_link, created_at, updated_at)
    VALUES ${placeholders}
  `;
  await db.query(sql, flatValues);
}

if (require.main === module) {
  syncLevel6Links()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { syncLevel6Links };
