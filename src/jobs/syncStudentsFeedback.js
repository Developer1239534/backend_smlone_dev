const fs = require('fs');
const mysql = require('/root/backend_smlone_dev/src/db/mysqlClient');
const db = require('/root/backend_smlone_dev/src/db/neonClient');

const SPREADSHEET_ID = '1eQ-xrOePs5vI1WHQQdi-j0DrGspnrk-Lt519joDKQCY';
const TAB_NAME = 'Students Feedback';
const CRED_PATH = '/root/sa_creds.json';
const MASTER_SPREADSHEET_ID = '14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU';

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
  console.log('=== [Sync Students Feedback] Starting Sync ===');
  const token = await getAccessToken();
  const authHeader = { Authorization: 'Bearer ' + token };

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
  console.log(`[DB] Found ${dbTraineeMap.size} existing trainees in database.`);

  // 2. Fetch raw rows from Google Sheets (Students Feedback)
  console.log(`[2/5] Fetching data from sheet: ${SPREADSHEET_ID} (${TAB_NAME})...`);
  const sheetRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${TAB_NAME}'!A1:U`,
    { headers: authHeader }
  );
  const sheetData = await sheetRes.json();
  if (!sheetData.values || sheetData.values.length < 2) {
    throw new Error('Failed to retrieve rows from Students Feedback');
  }

  const rawRows = sheetData.values;
  console.log(`[Sheet] Loaded ${rawRows.length} raw rows from Students Feedback.`);

  // 3. Process and match strictly by existing trainee ID
  console.log('[3/5] Matching IDs and aggregating columns: Speaking Project, Life Project, Last Time Speaking Date, Role 2, Role 3, Role 4...');
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
        classTrainersList: [],
        dateList: [],
        feedbackList: [],
        challengeList: [],
        speakingProjects: [],
        role2s: [],
        role3s: [],
        role4s: [],
        lifeProjects: [],
        level: String(row[17] || traineeInfo.level).trim(),
        latestSpeaking: '',
        latestLife: '',
        lastTimeSpeaking: '',
        className: String(row[20] || traineeInfo.class).trim()
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
    const lts = String(row[19] || '').trim();

    if (trainer && !rec.classTrainersList.includes(trainer)) rec.classTrainersList.push(trainer);
    if (dateVal && !rec.dateList.includes(dateVal)) rec.dateList.push(dateVal);

    if (feedback) {
      const fbEntry = trainer ? `${trainer} : ${feedback}` : feedback;
      if (!rec.feedbackList.includes(fbEntry)) rec.feedbackList.push(fbEntry);
    }
    if (challenge) {
      const chEntry = trainer ? `${trainer} : ${challenge}` : challenge;
      if (!rec.challengeList.includes(chEntry)) rec.challengeList.push(chEntry);
    }

    if (sp && !rec.speakingProjects.includes(sp)) {
      rec.speakingProjects.push(sp);
    }
    if (sp) rec.latestSpeaking = sp;

    if (lp && !rec.lifeProjects.includes(lp)) {
      rec.lifeProjects.push(lp);
    }
    if (lp) rec.latestLife = lp;

    if (role2 && !rec.role2s.includes(role2)) rec.role2s.push(role2);
    if (role3 && !rec.role3s.includes(role3)) rec.role3s.push(role3);
    if (role4 && !rec.role4s.includes(role4)) rec.role4s.push(role4);

    if (lts) rec.lastTimeSpeaking = lts;
  }

  console.log(`[Matching] Successfully matched ${aggregatedMap.size} trainees with data from Students Feedback.`);

  // 4. Update Database (MySQL & Neon Postgres)
  console.log('[4/5] Updating database tables (report_progres & profile_trainee)...');
  let updatedDbCount = 0;

  for (const [id, rec] of aggregatedMap.entries()) {
    const speakingProjectStr = rec.speakingProjects.join(' | ');
    const lifeProjectStr = rec.lifeProjects.join(' | ');
    const role2Str = rec.role2s.join(' | ');
    const role3Str = rec.role3s.join(' | ');
    const role4Str = rec.role4s.join(' | ');
    const lastTimeSpeakingStr = rec.lastTimeSpeaking;
    const latestSpeakingStr = rec.latestSpeaking || (rec.speakingProjects.length > 0 ? rec.speakingProjects[rec.speakingProjects.length - 1] : '');
    const trainerStr = rec.classTrainersList.join(' | ');
    const dateStr = rec.dateList.join(' | ');
    const feedbackStr = rec.feedbackList.join(' | ');
    const challengeStr = rec.challengeList.join(' | ');

    // 4a. Update profile_trainee
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
    await mysql.query(ptSql, [
      speakingProjectStr,
      lifeProjectStr,
      lastTimeSpeakingStr,
      role2Str,
      role3Str,
      role4Str,
      id
    ]);

    // Neon profile_trainee
    try {
      await db.query(
        `UPDATE profile_trainee 
         SET 
           "Speaking Project" = $1,
           "Life Project" = $2,
           "Last Time Speaking Date" = $3,
           "Role 2" = $4,
           "Role 3" = $5,
           "Role 4" = $6
         WHERE "ID" = $7`,
        [speakingProjectStr, lifeProjectStr, lastTimeSpeakingStr, role2Str, role3Str, role4Str, id]
      );
    } catch (e) {
      console.warn(`[Neon profile_trainee] Warning for ID ${id}:`, e.message);
    }

    // 4b. Upsert report_progres
    const rpSql = `
      INSERT INTO report_progres (
        \`ID\`, \`Student Name\`, \`Class Trainers\`, \`Date\`, \`Coach Feedback\`,
        \`Challenge\`, \`Speaking Project\`, \`Role 2\`, \`Role 3\`, \`Role 4\`,
        \`Life Project\`, \`House\`, \`Level\`, \`Latest Speaking Project\`,
        \`Last Time Speaking\`, \`Last Time Speaking Date\`, \`Class\`, \`updated_at\`
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
        \`updated_at\` = NOW()
    `;

    await mysql.query(rpSql, [
      id,
      rec.name,
      trainerStr,
      dateStr,
      feedbackStr,
      challengeStr,
      speakingProjectStr,
      role2Str,
      role3Str,
      role4Str,
      lifeProjectStr,
      rec.house,
      rec.level,
      latestSpeakingStr,
      lastTimeSpeakingStr,
      lastTimeSpeakingStr,
      rec.className
    ]);

    // Neon report_progres
    try {
      await db.query(
        `INSERT INTO report_progres (
          "ID", "Student Name", "Class Trainers", "Date", "Coach Feedback",
          "Challenge", "Speaking Project", "Role 2", "Role 3", "Role 4",
          "Life Project", "House", "Level", "Latest Speaking Project",
          "Last Time Speaking", "Last Time Speaking Date", "Class", "updated_at"
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
          "Last Time Speaking Date" = EXCLUDED."Last Time Speaking Date",
          "Class" = EXCLUDED."Class",
          "updated_at" = NOW()`,
        [
          id,
          rec.name,
          trainerStr,
          dateStr,
          feedbackStr,
          challengeStr,
          speakingProjectStr,
          role2Str,
          role3Str,
          role4Str,
          lifeProjectStr,
          rec.house,
          rec.level,
          latestSpeakingStr,
          lastTimeSpeakingStr,
          lastTimeSpeakingStr,
          rec.className
        ]
      );
    } catch (e) {
      console.warn(`[Neon report_progres] Warning for ID ${id}:`, e.message);
    }

    updatedDbCount++;
  }

  console.log(`[DB] Successfully updated ${updatedDbCount} trainee records in database.`);

  // 5. Update Masterfile Portal tab Report Progres
  console.log('[5/5] Updating Masterfile Portal Google Sheet tab Report Progres...');
  try {
    // Read existing Report Progres sheet
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
