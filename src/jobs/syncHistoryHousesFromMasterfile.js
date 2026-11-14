/**
 * SMLONE - Sync History Houses & House Allegiance from Masterfile Portal to MariaDB
 * Source: Masterfile Portal (Tab: 'History Houses' & 'House Allegiance')
 * Target: MariaDB & Neon PG (Tables: history_houses & questions)
 */

const { google } = require('googleapis');
const mysql = require('/root/backend_smlone_dev/src/db/mysqlClient');
const { Pool } = require('/root/backend_smlone_dev/node_modules/pg');
require('/root/backend_smlone_dev/node_modules/dotenv').config({ path: '/root/backend_smlone_dev/.env' });

const MASTERFILE_SPREADSHEET_ID = '14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU';

async function syncHistoryHousesAndAllegiance() {
  const startTime = Date.now();
  console.log('=== MEMULAI SINKRONISASI HISTORY HOUSES & HOUSE ALLEGIANCE DARI MASTERFILE PORTAL ===');

  const auth = new google.auth.GoogleAuth({
    keyFile: '/root/service_account_n8n.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Sinkronisasi History Houses
  console.log('1. Mengambil data dari tab "History Houses"...');
  const hhRes = await sheets.spreadsheets.values.get({
    spreadsheetId: MASTERFILE_SPREADSHEET_ID,
    range: "'History Houses'!A3:E"
  });
  const rawRows = hhRes.data.values || [];
  console.log(`   Ditemukan ${rawRows.length} baris di tab History Houses.`);

  const records = [];
  const seenIds = new Set();

  for (const r of rawRows) {
    const id = String(r[0] || '').trim();
    if (!id) continue;
    seenIds.add(id);

    const name = String(r[1] || '').trim();
    const className = String(r[2] || '').trim();
    const houseCorrected = String(r[3] || '').trim();
    const house = String(r[4] || '').trim() || (houseCorrected ? `House of ${houseCorrected}` : '');

    records.push({
      id,
      name,
      className,
      houseCorrected,
      house
    });
  }

  // Akun Preview 9999
  if (!seenIds.has('9999')) {
    records.push({
      id: '9999',
      name: 'Account Preview',
      className: 'Kelas Preview',
      houseCorrected: 'Thenova',
      house: 'House of Thenova'
    });
  }

  console.log(`   Ditemukan ${records.length} record History Houses valid (termasuk Account Preview 9999).`);

  // Batch upsert ke MariaDB
  console.log('2. Upsert ke MariaDB table history_houses...');
  let mariadbUpdated = 0;
  for (const rec of records) {
    await mysql.query(`
      INSERT INTO history_houses (\`ID\`, \`Name Corrected\`, \`Class Corrected\`, \`House Corrected\`, \`House\`, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        \`Name Corrected\` = VALUES(\`Name Corrected\`),
        \`Class Corrected\` = VALUES(\`Class Corrected\`),
        \`House Corrected\` = VALUES(\`House Corrected\`),
        \`House\` = VALUES(\`House\`),
        updated_at = NOW()
    `, [rec.id, rec.name, rec.className, rec.houseCorrected, rec.house]);
    mariadbUpdated++;
  }
  console.log(`   ✅ Selesai memperbarui ${mariadbUpdated} record di MariaDB history_houses.`);

  // 2. Sinkronisasi Questions (House Allegiance)
  console.log('3. Mengambil data soal kuis dari tab "House Allegiance"...');
  const qRes = await sheets.spreadsheets.values.get({
    spreadsheetId: MASTERFILE_SPREADSHEET_ID,
    range: "'House Allegiance'!A3:G30"
  });
  const qRows = qRes.data.values || [];
  const questionsToUpsert = [];

  for (let i = 0; i < qRows.length; i++) {
    const q = qRows[i];
    const questionText = String(q[0] || '').trim();
    if (!questionText) continue;

    const optA = String(q[1] || '').trim();
    const optB = String(q[2] || '').trim();
    const optC = String(q[3] || '').trim();
    const optD = String(q[4] || '').trim();
    const optE = String(q[5] || '').trim();

    const optionsObj = {
      A: optA,
      B: optB,
      C: optC,
      D: optD,
      E: optE
    };

    questionsToUpsert.push({
      id: String(i + 1),
      question: questionText,
      options: JSON.stringify(optionsObj)
    });
  }

  console.log(`   Ditemukan ${questionsToUpsert.length} pertanyaan kuis.`);
  for (const q of questionsToUpsert) {
    await mysql.query(`
      INSERT INTO questions (\`id\`, \`question\`, \`options\`, updated_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        \`question\` = VALUES(\`question\`),
        \`options\` = VALUES(\`options\`),
        updated_at = NOW()
    `, [q.id, q.question, q.options]);
  }
  console.log(`   ✅ Selesai memperbarui ${questionsToUpsert.length} pertanyaan di MariaDB questions.`);

  // 3. Paritas ke Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    console.log('4. Mensinkronkan data ke Neon PostgreSQL...');
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
      let pgUpdated = 0;
      for (const rec of records) {
        await pgPool.query(`
          INSERT INTO history_houses ("ID", "Name Corrected", "Class Corrected", "House Corrected", "House", updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT ("ID") DO UPDATE SET
            "Name Corrected" = EXCLUDED."Name Corrected",
            "Class Corrected" = EXCLUDED."Class Corrected",
            "House Corrected" = EXCLUDED."House Corrected",
            "House" = EXCLUDED."House",
            updated_at = NOW()
        `, [rec.id, rec.name, rec.className, rec.houseCorrected, rec.house]);
        pgUpdated++;
      }
      console.log(`   ✅ Selesai memperbarui ${pgUpdated} record di Neon PG history_houses.`);
    } catch (pgErr) {
      console.warn('   ⚠️ Warning Neon PG sync:', pgErr.message);
    } finally {
      await pgPool.end();
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🎉 SINKRONISASI HISTORY HOUSES SELESAI SEMPURNA DALAM ${duration} DETIK!`);
}

if (require.main === module) {
  syncHistoryHousesAndAllegiance()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error sinkronisasi history houses:', err);
      process.exit(1);
    });
}

module.exports = { syncHistoryHousesAndAllegiance };
