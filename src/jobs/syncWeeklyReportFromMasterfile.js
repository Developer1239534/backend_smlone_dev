/**
 * SMLONE - Sync Weekly Report & Transkrip Belajar from Masterfile Portal
 * Source of Truth: Masterfile Portal Google Sheet (Tab: 'Weekly Report' / 'Weekly Report And Transkrip Belajar', SheetId: 835775703)
 * Target: MariaDB & Neon PostgreSQL (Table: report_progres)
 */

const { google } = require('googleapis');
const mysql = require('/root/backend_smlone_dev/src/db/mysqlClient');
const { Pool } = require('/root/backend_smlone_dev/node_modules/pg');
require('/root/backend_smlone_dev/node_modules/dotenv').config({ path: '/root/backend_smlone_dev/.env' });

const MASTERFILE_SPREADSHEET_ID = '14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU';
const TARGET_SHEET_ID = 835775703;

const monthMap = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6,
  agu: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11
};

function parseDateToTimestamp(dStr) {
  if (!dStr) return 0;
  const clean = String(dStr).trim();
  const m1 = clean.match(/^(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{2,4}))?$/);
  if (m1) {
    const day = parseInt(m1[1], 10);
    const mStr = m1[2].toLowerCase().slice(0, 3);
    const month = monthMap[mStr];
    let year = m1[3] ? parseInt(m1[3], 10) : 2026;
    if (year < 100) year += 2000;
    if (month !== undefined) return new Date(year, month, day).getTime();
  }
  const m2 = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (m2) {
    const day = parseInt(m2[1], 10);
    const month = parseInt(m2[2], 10) - 1;
    let year = parseInt(m2[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day).getTime();
  }
  const parsed = Date.parse(clean);
  return isNaN(parsed) ? 0 : parsed;
}

async function syncWeeklyReportAndTranskrip() {
  const startTime = Date.now();
  console.log('=== MEMULAI SINKRONISASI WEEKLY REPORT & TRANSKRIP BELAJAR DARI MASTERFILE PORTAL ===');

  const auth = new google.auth.GoogleAuth({
    keyFile: '/root/service_account_n8n.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Dapatkan nama tab dinamis berdasarkan SheetId 835775703
  console.log('1. Memeriksa metadata sheet Masterfile Portal...');
  const meta = await sheets.spreadsheets.get({ spreadsheetId: MASTERFILE_SPREADSHEET_ID });
  let targetSheet = meta.data.sheets.find(s => s.properties.sheetId === TARGET_SHEET_ID);
  if (!targetSheet) {
    targetSheet = meta.data.sheets.find(s => /weekly\s*report/i.test(s.properties.title));
  }
  const sheetTitle = targetSheet ? targetSheet.properties.title : 'Weekly Report';
  console.log(`   Nama tab terdeteksi: "${sheetTitle}" (SheetId: ${TARGET_SHEET_ID})`);

  // 2. Unduh seluruh baris data dari tab
  console.log(`2. Mengunduh data dari tab '${sheetTitle}'!A2:N...`);
  const sheetRes = await sheets.spreadsheets.values.get({
    spreadsheetId: MASTERFILE_SPREADSHEET_ID,
    range: `'${sheetTitle}'!A2:N`
  });
  const rawRows = sheetRes.data.values || [];
  console.log(`   Ditemukan ${rawRows.length} baris (termasuk header).`);

  if (rawRows.length <= 1) {
    console.log('⚠️ Tidak ada baris data untuk disinkronkan.');
    return;
  }

  // 3. Load profile_trainee dari MariaDB untuk metadata House, Level, dsb
  console.log('3. Mengambil profil trainee aktif dari database...');
  const profRes = await mysql.query('SELECT ID, Name, Class, Level, HOUSE FROM profile_trainee');
  const profMap = new Map();
  profRes.rows.forEach(p => {
    const id = String(p.ID || '').trim();
    if (id) profMap.set(id, p);
  });
  console.log(`   Ditemukan ${profMap.size} profil trainee dari profile_trainee.`);

  // 4. Kelompokkan seluruh baris sesi per ID Trainee
  console.log('4. Mengelompokkan dan memproses data per ID siswa...');
  const studentMap = new Map();

  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    const id = String(r[0] || '').trim();
    if (!id) continue;

    if (!studentMap.has(id)) {
      const prof = profMap.get(id) || {};
      studentMap.set(id, {
        id,
        name: String(r[1] || prof.Name || '').trim(),
        className: String(r[13] || prof.Class || '').trim(),
        house: String(prof.HOUSE || '').trim(),
        level: String(prof.Level || '').trim(),
        latestSpeakingProject: String(r[12] || '').trim(),
        totalGold: String(r[11] || '0').trim(),
        sessions: []
      });
    }

    const st = studentMap.get(id);
    const trainer = String(r[2] || '').trim();
    const date = String(r[3] || '').trim();
    const feedback = String(r[4] || '').trim();
    const challenge = String(r[5] || '').trim();
    const sp = String(r[6] || '').trim();
    const r2 = String(r[7] || '').trim();
    const r3 = String(r[8] || '').trim();
    const r4 = String(r[9] || '').trim();
    const lp = String(r[10] || '').trim();
    const gold = String(r[11] || '').trim();

    st.sessions.push({
      date: date || '-',
      trainer: trainer || '-',
      feedback: feedback || '-',
      challenge: challenge || '-',
      speaking_project: sp || '-',
      role_2: r2 || '-',
      role_3: r3 || '-',
      role_4: r4 || '-',
      life_project: lp || '-',
      total_gold: gold || '0',
      latest_speaking_project: st.latestSpeakingProject || sp || '-',
      last_time_speaking: date || '-',
      _rowIdx: i
    });
  }

  console.log(`   Ditemukan total ${studentMap.size} siswa unik dengan sesi belajar.`);

  // 5. Normalisasi urutan kronologis menurun (tanggal terbaru di index 0)
  console.log('5. Menyusun transkrip kronologis menurun & serialisasi JSON...');
  const recordsToUpsert = [];

  for (const [id, st] of studentMap.entries()) {
    // Urutkan sesi kronologis menurun
    st.sessions.sort((a, b) => {
      const tA = parseDateToTimestamp(a.date);
      const tB = parseDateToTimestamp(b.date);
      if (tA !== tB) return tB - tA; // Tanggal terbaru di posisi index 0
      return b._rowIdx - a._rowIdx;
    });

    const cleanSessions = st.sessions.map(({ _rowIdx, ...s }) => s);
    const sessionsJson = JSON.stringify(cleanSessions);

    const dateStr = cleanSessions.map(s => s.date).join(' | ');
    const trainerStr = cleanSessions.map(s => s.trainer).join(' | ');
    const feedbackStr = cleanSessions.map(s => (s.trainer && s.trainer !== '-' ? `${s.trainer} : ${s.feedback}` : s.feedback)).join(' | ');
    const challengeStr = cleanSessions.map(s => (s.trainer && s.trainer !== '-' ? `${s.trainer} : ${s.challenge}` : s.challenge)).join(' | ');
    const speakingProjectStr = cleanSessions.map(s => s.speaking_project).join(' | ');
    const role2Str = cleanSessions.map(s => s.role_2).join(' | ');
    const role3Str = cleanSessions.map(s => s.role_3).join(' | ');
    const role4Str = cleanSessions.map(s => s.role_4).join(' | ');
    const lifeProjectStr = cleanSessions.map(s => s.life_project).join(' | ');

    // Latest speaking project
    let latestSp = st.latestSpeakingProject;
    if (!latestSp || latestSp === '-') {
      const spSession = cleanSessions.find(s => s.speaking_project && s.speaking_project !== '-');
      latestSp = spSession ? spSession.speaking_project : '-';
    }

    // Last time speaking date
    let lastTimeSpeakingDate = '-';
    const spSession = cleanSessions.find(s => s.speaking_project && s.speaking_project !== '-');
    if (spSession) {
      lastTimeSpeakingDate = spSession.date;
    } else if (cleanSessions.length > 0) {
      lastTimeSpeakingDate = cleanSessions[0].date;
    }

    recordsToUpsert.push({
      id: st.id,
      name: st.name,
      trainers: trainerStr,
      date: dateStr,
      feedback: feedbackStr,
      challenge: challengeStr,
      speakingProject: speakingProjectStr,
      role2: role2Str,
      role3: role3Str,
      role4: role4Str,
      lifeProject: lifeProjectStr,
      totalGold: st.totalGold,
      latestSpeakingProject: latestSp,
      className: st.className,
      house: st.house,
      level: st.level,
      lastTimeSpeakingDate: lastTimeSpeakingDate,
      sessionsJson: sessionsJson
    });
  }

  // Pastikan akun testing ID 9999 tetap ada jika belum terdaftar di sheet
  if (!studentMap.has('9999')) {
    const dummySessions = [{
      date: '07 Nov 26',
      trainer: 'Sir Rakha (Preview Account)',
      feedback: 'Hai ini akun preview',
      challenge: 'Hai ini akun preview',
      speaking_project: 'Project Preview',
      role_2: '-',
      role_3: '-',
      role_4: '-',
      life_project: 'Project Preview',
      total_gold: '0',
      latest_speaking_project: 'Project Preview',
      last_time_speaking: '07 Nov 26'
    }];
    recordsToUpsert.push({
      id: '9999',
      name: 'Account Preview',
      trainers: 'Sir Rakha (Preview Account)',
      date: '07 Nov 26',
      feedback: 'Sir Rakha (Preview Account) : Hai ini akun preview',
      challenge: 'Sir Rakha (Preview Account) : Hai ini akun preview',
      speakingProject: 'Project Preview',
      role2: '-',
      role3: '-',
      role4: '-',
      lifeProject: 'Project Preview',
      totalGold: '0',
      latestSpeakingProject: 'Project Preview',
      className: 'Kelas Preview',
      house: 'House Preview',
      level: 'Level Preview',
      lastTimeSpeakingDate: '07 Nov 26',
      sessionsJson: JSON.stringify(dummySessions)
    });
  }

  // 6. Tulis ke MariaDB Hostinger
  console.log(`6. Melakukan batch upsert ${recordsToUpsert.length} record ke MariaDB (report_progres)...`);
  const BATCH_SIZE = 50;
  let mariadbUpdated = 0;

  for (let i = 0; i < recordsToUpsert.length; i += BATCH_SIZE) {
    const batch = recordsToUpsert.slice(i, i + BATCH_SIZE);
    for (const rec of batch) {
      await mysql.query(`
        INSERT INTO report_progres (
          \`ID\`,
          \`Student Name\`,
          \`Class Trainers\`,
          \`Date\`,
          \`Coach Feedback\`,
          \`Challenge\`,
          \`Speaking Project\`,
          \`Role 2\`,
          \`Role 3\`,
          \`Role 4\`,
          \`Life Project\`,
          \`Total Gold\`,
          \`Latest Speaking Project\`,
          \`Class\`,
          \`House\`,
          \`Level\`,
          \`Last Time Speaking\`,
          \`Last Time Speaking Date\`,
          \`sessions\`,
          \`sessions_json\`,
          \`updated_at\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          \`Student Name\` = VALUES(\`Student Name\`),
          \`Class Trainers\` = VALUES(\`Class Trainers\`),
          \`Date\` = VALUES(\`Date\`),
          \`Coach Feedback\` = VALUES(\`Coach Feedback\`),
          \`Challenge\` = VALUES(\`Challenge\`),
          \`Speaking Project\` = VALUES(\`Speaking Project\`),
          \`Role 2\` = VALUES(\`Role 2\`),
          \`Role 3\` = VALUES(\`Role 3\`),
          \`Role 4\` = VALUES(\`Role 4\`),
          \`Life Project\` = VALUES(\`Life Project\`),
          \`Total Gold\` = VALUES(\`Total Gold\`),
          \`Latest Speaking Project\` = VALUES(\`Latest Speaking Project\`),
          \`Class\` = VALUES(\`Class\`),
          \`House\` = CASE WHEN VALUES(\`House\`) != '' THEN VALUES(\`House\`) ELSE \`House\` END,
          \`Level\` = CASE WHEN VALUES(\`Level\`) != '' THEN VALUES(\`Level\`) ELSE \`Level\` END,
          \`Last Time Speaking\` = VALUES(\`Last Time Speaking\`),
          \`Last Time Speaking Date\` = VALUES(\`Last Time Speaking Date\`),
          \`sessions\` = VALUES(\`sessions\`),
          \`sessions_json\` = VALUES(\`sessions_json\`),
          \`updated_at\` = NOW()
      `, [
        rec.id, rec.name, rec.trainers, rec.date, rec.feedback, rec.challenge,
        rec.speakingProject, rec.role2, rec.role3, rec.role4, rec.lifeProject,
        rec.totalGold, rec.latestSpeakingProject, rec.className, rec.house, rec.level,
        rec.lastTimeSpeakingDate, rec.lastTimeSpeakingDate, rec.sessionsJson, rec.sessionsJson
      ]);
      mariadbUpdated++;
    }
  }
  console.log(`   ✅ Selesai memperbarui ${mariadbUpdated} record di MariaDB.`);

  // 7. Paritas ke Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    console.log('7. Mensinkronkan data ke Neon PostgreSQL...');
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
      let pgUpdated = 0;
      for (const rec of recordsToUpsert) {
        await pgPool.query(`
          INSERT INTO report_progres (
            "ID",
            "Student Name",
            "Class Trainers",
            "Date",
            "Coach Feedback",
            "Challenge",
            "Speaking Project",
            "Role 2",
            "Role 3",
            "Role 4",
            "Life Project",
            "Total Gold",
            "Latest Speaking Project",
            "Class",
            "House",
            "Level",
            "Last Time Speaking",
            "Last Time Speaking Date",
            sessions,
            sessions_json,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
          ON CONFLICT ("ID") DO UPDATE SET
            "Student Name" = EXCLUDED."Student Name",
            "Class Trainers" = EXCLUDED."Class Trainers",
            "Date" = EXCLUDED."Date",
            "Coach Feedback" = EXCLUDED."Coach Feedback",
            "Challenge" = EXCLUDED."Challenge",
            "Speaking Project" = EXCLUDED."Speaking Project",
            "Role 2" = EXCLUDED."Role 2",
            "Role 3" = EXCLUDED."Role 3",
            "Role 4" = EXCLUDED."Role 4",
            "Life Project" = EXCLUDED."Life Project",
            "Total Gold" = EXCLUDED."Total Gold",
            "Latest Speaking Project" = EXCLUDED."Latest Speaking Project",
            "Class" = EXCLUDED."Class",
            "House" = CASE WHEN EXCLUDED."House" != '' THEN EXCLUDED."House" ELSE report_progres."House" END,
            "Level" = CASE WHEN EXCLUDED."Level" != '' THEN EXCLUDED."Level" ELSE report_progres."Level" END,
            "Last Time Speaking" = EXCLUDED."Last Time Speaking",
            "Last Time Speaking Date" = EXCLUDED."Last Time Speaking Date",
            sessions = EXCLUDED.sessions,
            sessions_json = EXCLUDED.sessions_json,
            updated_at = NOW()
        `, [
          rec.id, rec.name, rec.trainers, rec.date, rec.feedback, rec.challenge,
          rec.speakingProject, rec.role2, rec.role3, rec.role4, rec.lifeProject,
          rec.totalGold, rec.latestSpeakingProject, rec.className, rec.house, rec.level,
          rec.lastTimeSpeakingDate, rec.lastTimeSpeakingDate, rec.sessionsJson, rec.sessionsJson
        ]);
        pgUpdated++;
      }
      console.log(`   ✅ Selesai memperbarui ${pgUpdated} record di Neon PostgreSQL.`);
    } catch (pgErr) {
      console.warn('   ⚠️ Warning Neon PG sync:', pgErr.message);
    } finally {
      await pgPool.end();
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🎉 SINKRONISASI SELESAI SEMPURNA DALAM ${duration} DETIK!`);
}

if (require.main === module) {
  syncWeeklyReportAndTranskrip()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error sinkronisasi:', err);
      process.exit(1);
    });
}

module.exports = { syncWeeklyReportAndTranskrip };
