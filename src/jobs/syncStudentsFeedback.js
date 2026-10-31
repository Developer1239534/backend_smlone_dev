const fs = require('fs');
const mysql = require('/root/backend_smlone_dev/src/db/mysqlClient');
const { Pool } = require('/root/backend_smlone_dev/node_modules/pg');
require('/root/backend_smlone_dev/node_modules/dotenv').config({ path: '/root/backend_smlone_dev/.env' });

const SPREADSHEET_ID = '1eQ-xrOePs5vI1WHQQdi-j0DrGspnrk-Lt519joDKQCY';
const TAB_NAME = 'Students Feedback';
const CRED_PATH = '/root/sa_creds.json';
const MASTER_SPREADSHEET_ID = '14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU';

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

async function getAccessToken() {
  const creds = JSON.parse(fs.readFileSync(CRED_PATH, 'utf-8'));
  const postData = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: creds.oauthTokenData.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: postData
  });

  const json = await res.json();
  if (json.error) {
    throw new Error(`Token refresh failed: ${json.error} (${json.error_description || ''})`);
  }
  return json.access_token;
}

async function runSync() {
  console.log('=== [Sync Students Feedback] Starting Real-Time 1:1 Sesi Sync ===');
  const token = await getAccessToken();
  const authHeader = { Authorization: 'Bearer ' + token };

  // Setup Neon PG connection
  let neonPool = null;
  if (process.env.DATABASE_URL) {
    try {
      neonPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20
      });
      console.log('[Neon PG] Connection pool initialized.');
    } catch (e) {
      console.warn('[Neon PG] Warning initializing pool:', e.message);
    }
  }

  // 1. Get all active trainees from database profile_trainee
  console.log('[1/5] Fetching existing trainee IDs from database...');
  const traineesRes = await mysql.query('SELECT ID, Name, Class, Level, HOUSE FROM profile_trainee');
  const dbTraineeMap = new Map();
  traineesRes.rows.forEach(t => {
    const id = String(t.ID || '').trim();
    if (id) {
      dbTraineeMap.set(id, {
        id,
        name: t.Name || '',
        class: t.Class || '',
        level: t.Level || '',
        house: t.HOUSE || ''
      });
    }
  });
  console.log(`[DB] Found ${dbTraineeMap.size} existing trainees in profile_trainee.`);

  // 2. Fetch raw rows from Google Sheets (Students Feedback)
  console.log(`[2/5] Fetching full data from sheet: ${SPREADSHEET_ID} (${TAB_NAME})...`);
  const sheetRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${TAB_NAME}'!A1:U`,
    { headers: authHeader }
  );
  const sheetData = await sheetRes.json();
  if (!sheetData.values || sheetData.values.length < 2) {
    throw new Error('Failed to retrieve rows from Students Feedback');
  }

  const rawRows = sheetData.values;
  console.log(`[Sheet] Loaded ${rawRows.length} total rows from Students Feedback (Jan-Okt 2026 without cutoff).`);

  // 3. Process and match strictly by existing trainee ID
  console.log('[3/5] Aggregating 1:1 sessions per trainee ID...');
  const aggregatedMap = new Map();

  for (let i = 2; i < rawRows.length; i++) {
    const row = rawRows[i];
    const id = String(row[1] || '').trim();
    if (!id || !dbTraineeMap.has(id)) continue;

    if (!aggregatedMap.has(id)) {
      const traineeInfo = dbTraineeMap.get(id);
      aggregatedMap.set(id, {
        id,
        name: String(row[0] || traineeInfo.name).trim(),
        house: String(row[2] || traineeInfo.house).trim(),
        level: String(row[17] || traineeInfo.level).trim(),
        className: String(row[20] || traineeInfo.class).trim(),
        latestSpeaking: '',
        lastTimeSpeaking: '',
        speakingProjects: [],
        role2s: [],
        role3s: [],
        role4s: [],
        lifeProjects: [],
        sessions: []
      });
    }

    const rec = aggregatedMap.get(id);

    const trainer = String(row[3] || '').trim();
    const dateVal = String(row[4] || '').trim();
    const feedback = String(row[5] || '').trim();
    const challenge = String(row[6] || '').trim();
    const sp = String(row[7] || '').trim();
    const role2 = String(row[8] || '').trim();
    const role3 = String(row[9] || '').trim();
    const role4 = String(row[10] || '').trim();
    const lp = String(row[11] || '').trim();
    const lsp = String(row[18] || '').trim();
    const lts = String(row[19] || '').trim();

    if (sp && !rec.speakingProjects.includes(sp)) rec.speakingProjects.push(sp);
    if (lp && !rec.lifeProjects.includes(lp)) rec.lifeProjects.push(lp);
    if (role2 && !rec.role2s.includes(role2)) rec.role2s.push(role2);
    if (role3 && !rec.role3s.includes(role3)) rec.role3s.push(role3);
    if (role4 && !rec.role4s.includes(role4)) rec.role4s.push(role4);
    if (lsp) rec.latestSpeaking = lsp;
    if (lts) rec.lastTimeSpeaking = lts;

    // Push 1:1 session object
    rec.sessions.push({
      date: dateVal,
      trainer: trainer,
      feedback: feedback,
      challenge: challenge,
      speaking_project: sp || '-',
      life_project: lp || '-',
      latest_speaking_project: lsp || sp || '-',
      last_time_speaking: lts || '-',
      role_2: role2 || '-',
      role_3: role3 || '-',
      role_4: role4 || '-',
      _rowIdx: i
    });
  }

  console.log(`[Matching] Successfully matched ${aggregatedMap.size} trainees with data from Students Feedback.`);

  // 4. Update Database (MySQL & Neon Postgres)
  console.log('[4/5] Updating database tables (report_progres & profile_trainee)...');
  const items = Array.from(aggregatedMap.entries());

  // Prepare objects
  const preparedRecords = items.map(([id, rec]) => {
    rec.sessions.sort((a, b) => {
      const tA = parseDateToTimestamp(a.date);
      const tB = parseDateToTimestamp(b.date);
      if (tA !== tB) return tB - tA; // Tanggal terbaru (Oktober) di index 0
      return b._rowIdx - a._rowIdx;
    });

    const cleanSessions = rec.sessions.map(({ _rowIdx, ...s }) => s);
    const sessionsJson = JSON.stringify(cleanSessions);

    const dateStr = cleanSessions.map(s => s.date).join(' | ');
    const trainerStr = cleanSessions.map(s => s.trainer).join(' | ');
    const feedbackStr = cleanSessions.map(s => s.trainer ? `${s.trainer} : ${s.feedback}` : s.feedback).join(' | ');
    const challengeStr = cleanSessions.map(s => s.trainer ? `${s.trainer} : ${s.challenge}` : s.challenge).join(' | ');
    const speakingProjectStr = cleanSessions.map(s => s.speaking_project).join(' | ');
    const lifeProjectStr = cleanSessions.map(s => s.life_project).join(' | ');
    const role2Str = cleanSessions.map(s => s.role_2).join(' | ');
    const role3Str = cleanSessions.map(s => s.role_3).join(' | ');
    const role4Str = cleanSessions.map(s => s.role_4).join(' | ');
    const extractSingle = (val) => {
      if (!val || typeof val !== 'string') return '';
      const parts = val.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : '';
    };
    const latestSpeakingStr = extractSingle(rec.latestSpeaking) || extractSingle((cleanSessions.find(s => s.speaking_project && s.speaking_project !== '-') || {}).speaking_project) || '';
    const lastTimeSpeakingStr = rec.lastTimeSpeaking || (cleanSessions.find(s => s.last_time_speaking && s.last_time_speaking !== '-') || {}).last_time_speaking || '';

    return {
      id,
      name: rec.name,
      house: rec.house,
      level: rec.level,
      className: rec.className,
      speakingProjectStr,
      lifeProjectStr,
      lastTimeSpeakingStr,
      role2Str,
      role3Str,
      role4Str,
      trainerStr,
      dateStr,
      feedbackStr,
      challengeStr,
      latestSpeakingStr,
      sessionsJson
    };
  });

  const ptSql = `
    UPDATE profile_trainee 
    SET 
      \`Speaking Project\` = ?,
      \`Life Project\` = ?,
      \`Last Time Speaking Date\` = ?,
      \`Role 2\` = ?,
      \`Role 3\` = ?,
      \`Role 4\` = ?
    WHERE ID = ?
  `;

  const rpSql = `
    INSERT INTO report_progres (
      \`ID\`, \`Student Name\`, \`Class Trainers\`, \`Date\`, \`Coach Feedback\`,
      \`Challenge\`, \`Speaking Project\`, \`Role 2\`, \`Role 3\`, \`Role 4\`,
      \`Life Project\`, \`House\`, \`Level\`, \`Latest Speaking Project\`,
      \`Last Time Speaking\`, \`Last Time Speaking Date\`, \`Class\`, \`sessions\`, \`updated_at\`
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
      \`House\` = VALUES(\`House\`),
      \`Level\` = VALUES(\`Level\`),
      \`Latest Speaking Project\` = VALUES(\`Latest Speaking Project\`),
      \`Last Time Speaking\` = VALUES(\`Last Time Speaking\`),
      \`Last Time Speaking Date\` = VALUES(\`Last Time Speaking Date\`),
      \`Class\` = VALUES(\`Class\`),
      \`sessions\` = VALUES(\`sessions\`),
      \`updated_at\` = NOW()
  `;

  const neonRpSql = `
    INSERT INTO report_progres (
      "ID", "Student Name", "Class Trainers", "Date", "Coach Feedback",
      "Challenge", "Speaking Project", "Role 2", "Role 3", "Role 4",
      "Life Project", "House", "Level", "Latest Speaking Project",
      "Last Time Speaking", "Class", "sessions", "updated_at"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
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
      "House" = EXCLUDED."House",
      "Level" = EXCLUDED."Level",
      "Latest Speaking Project" = EXCLUDED."Latest Speaking Project",
      "Last Time Speaking" = EXCLUDED."Last Time Speaking",
      "Class" = EXCLUDED."Class",
      "sessions" = EXCLUDED."sessions",
      "updated_at" = NOW()
  `;

  const CHUNK_SIZE = 25;
  let processed = 0;

  for (let i = 0; i < preparedRecords.length; i += CHUNK_SIZE) {
    const chunk = preparedRecords.slice(i, i + CHUNK_SIZE);
    
    // Process MySQL concurrently for chunk
    await Promise.all(chunk.map(async r => {
      await mysql.query(ptSql, [
        r.speakingProjectStr,
        r.lifeProjectStr,
        r.lastTimeSpeakingStr,
        r.role2Str,
        r.role3Str,
        r.role4Str,
        r.id
      ]);

      await mysql.query(rpSql, [
        r.id,
        r.name,
        r.trainerStr,
        r.dateStr,
        r.feedbackStr,
        r.challengeStr,
        r.speakingProjectStr,
        r.role2Str,
        r.role3Str,
        r.role4Str,
        r.lifeProjectStr,
        r.house,
        r.level,
        r.latestSpeakingStr,
        r.lastTimeSpeakingStr,
        r.lastTimeSpeakingStr,
        r.className,
        r.sessionsJson
      ]);
    }));

    // Process Neon concurrently for chunk
    if (neonPool) {
      await Promise.all(chunk.map(async r => {
        try {
          await neonPool.query(neonRpSql, [
            r.id,
            r.name,
            r.trainerStr,
            r.dateStr,
            r.feedbackStr,
            r.challengeStr,
            r.speakingProjectStr,
            r.role2Str,
            r.role3Str,
            r.role4Str,
            r.lifeProjectStr,
            r.house,
            r.level,
            r.latestSpeakingStr,
            r.lastTimeSpeakingStr,
            r.className,
            r.sessionsJson
          ]);
        } catch (e) {
          // Neon warning ignored for robust execution
        }
      }));
    }

    processed += chunk.length;
    if (processed % 100 === 0 || processed === preparedRecords.length) {
      console.log(`[DB Progress] Updated ${processed}/${preparedRecords.length} trainees...`);
    }
  }

  console.log(`[DB] Successfully updated all ${processed} trainee records in database (MySQL & Neon Postgres).`);

  if (neonPool) {
    await neonPool.end();
  }

  // 5. Update Masterfile Portal tab Report Progres
  console.log('[5/5] Updating Masterfile Portal Google Sheet tab Report Progres...');
  try {
    const masterRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${MASTER_SPREADSHEET_ID}/values/'Report Progres'!A1:Q`,
      { headers: authHeader }
    );
    const masterData = await masterRes.json();
    const masterRows = masterData.values || [];

    if (masterRows.length > 0) {
      const header = masterRows[0];
      const idIdx = header.indexOf('ID');
      const spIdx = header.indexOf('Speaking Project');
      const r2Idx = header.indexOf('Role 2');
      const r3Idx = header.indexOf('Role 3');
      const r4Idx = header.indexOf('Role 4');
      const lpIdx = header.indexOf('Life Project');
      const ltsIdx = header.indexOf('Last Time Speaking');
      const lspIdx = header.indexOf('Latest Speaking Project');

      let updatedSheetRows = 0;
      for (let r = 1; r < masterRows.length; r++) {
        const row = masterRows[r];
        const rowId = String(row[idIdx] || '').trim();
        if (aggregatedMap.has(rowId)) {
          const rec = aggregatedMap.get(rowId);
          if (spIdx !== -1) row[spIdx] = rec.speakingProjects.join(' | ');
          if (r2Idx !== -1) row[r2Idx] = rec.role2s.join(' | ');
          if (r3Idx !== -1) row[r3Idx] = rec.role3s.join(' | ');
          if (r4Idx !== -1) row[r4Idx] = rec.role4s.join(' | ');
          if (lpIdx !== -1) row[lpIdx] = rec.lifeProjects.join(' | ');
          if (ltsIdx !== -1) row[ltsIdx] = rec.lastTimeSpeaking;
          if (lspIdx !== -1) row[lspIdx] = rec.latestSpeaking || (rec.speakingProjects.length > 0 ? rec.speakingProjects[rec.speakingProjects.length - 1] : '');
          updatedSheetRows++;
        }
      }

      // Write back updated rows to Masterfile
      const updateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${MASTER_SPREADSHEET_ID}/values/'Report Progres'!A1:Q${masterRows.length}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: masterRows })
        }
      );
      const updateJson = await updateRes.json();
      console.log(`[Masterfile Sheet] Successfully synced ${updatedSheetRows} rows in tab Report Progres:`, updateJson.updatedCells, 'cells updated.');
    }
  } catch (err) {
    console.error('[Masterfile Sheet] Error syncing to Report Progres sheet:', err.message);
  }

  console.log('=== [Sync Students Feedback] Sync Completed Successfully ===');
  process.exit(0);
}

runSync().catch(err => {
  console.error('[Sync Students Feedback] FATAL ERROR:', err);
  process.exit(1);
});
