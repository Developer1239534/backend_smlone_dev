const fs = require('fs');
const https = require('https');
const mysql = require('/root/backend_smlone_dev/src/db/mysqlClient');
const { Pool } = require('/root/backend_smlone_dev/node_modules/pg');
require('/root/backend_smlone_dev/node_modules/dotenv').config({ path: '/root/backend_smlone_dev/.env' });

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1Ed60KEQ5gWeKMZcUSs2sPlW7Ua4qruwhjyKf_cclooI/export?format=csv&gid=1591209404';

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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCSVLine(text) {
  const p = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuote && text[i+1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (c === ',' && !inQuote) {
      p.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  p.push(cur);
  return p;
}

async function run() {
  console.log('=== [Sync Students Feedback via Mirror Tab] ===');
  console.log('[1/4] Fetching active trainees from database...');
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
  console.log(`[DB] Loaded ${dbTraineeMap.size} trainees.`);

  console.log('[2/4] Downloading IR_Students Feedback CSV from Google Sheets...');
  const csvRaw = await fetchUrl(SPREADSHEET_URL);
  const lines = csvRaw.split(/\r?\n/);
  console.log(`[Sheet] Loaded ${lines.length} lines.`);

  const aggregatedMap = new Map();

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const row = parseCSVLine(line);
    if (row.length < 5) continue;

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

  console.log(`[3/4] Matched ${aggregatedMap.size} trainees with sessions.`);

  // Prepare objects
  const items = Array.from(aggregatedMap.entries());
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

  console.log('[4/4] Writing to MySQL and Neon Postgres...');

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

  // Neon Pool
  let neonPool = null;
  if (process.env.DATABASE_URL) {
    try {
      neonPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20
      });
    } catch (e) {
      console.warn('[Neon PG] Error initializing pool:', e.message);
    }
  }

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
  for (let i = 0; i < preparedRecords.length; i += CHUNK_SIZE) {
    const chunk = preparedRecords.slice(i, i + CHUNK_SIZE);
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

      if (neonPool) {
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
          // ignore neon error if table difference
        }
      }
    }));
    process.stdout.write(`\r[Progress] ${Math.min(i + CHUNK_SIZE, preparedRecords.length)} / ${preparedRecords.length} trainees updated.`);
  }

  console.log('\n=== [SYNC FINISHED SUCCESSFULLY] ===');
  process.exit(0);
}

run().catch(err => {
  console.error('\nSync failed:', err);
  process.exit(1);
});
