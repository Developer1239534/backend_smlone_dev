const https = require('https');
const mysql = require('../db/mysqlClient');
const { Pool } = require('pg');
require('dotenv').config();

const SPREADSHEET_ID = '1JMhLNw-DIJCCkK_RBhPBp61sQZTMNkzYhPgxE_WLnlU';
const RMT_GID = '518517586';

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

function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let cur = '';

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      row.push(cur);
      lines.push(row);
      row = [];
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur || row.length > 0) {
    row.push(cur);
    lines.push(row);
  }
  return lines;
}

async function syncMonthlyGoldPoints() {
  console.log('=== [SYNC MONTHLY GOLD POINTS: RESULT MONTH TRAINEE -> DB & API] ===');

  // 1. Fetch Trainee metadata from MySQL profile_trainee
  console.log('[1/5] Fetching profile_trainee metadata from MySQL...');
  const ptRes = await mysql.query('SELECT ID, Name, MEMBERSHIP, Level, HOUSE, Class, Trainer FROM profile_trainee WHERE ID != ""');
  const profileMap = new Map();
  ptRes.rows.forEach(r => {
    const id = String(r.ID || '').trim();
    if (id) {
      profileMap.set(id, {
        id,
        name: r.Name || '',
        membership: r.MEMBERSHIP || 'Active',
        level: r.Level || '',
        house: r.HOUSE || '',
        class: r.Class || '',
        trainer: r.Trainer || ''
      });
    }
  });
  console.log(`[DB] Loaded ${profileMap.size} trainees from profile_trainee.`);

  // 2. Fetch CSVs from Google Sheets
  console.log(`[2/5] Fetching Google Sheets (RMT tab GID ${RMT_GID} & TOTAL GOLD PER ID)...`);
  const rmtCsvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${RMT_GID}`;
  const totalCsvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=TOTAL+GOLD+PER+ID`;

  const [rmtRaw, totalRaw] = await Promise.all([
    fetchUrl(rmtCsvUrl),
    fetchUrl(totalCsvUrl)
  ]);

  const rmtRows = parseCSV(rmtRaw);
  const totalRows = parseCSV(totalRaw);

  console.log(`[Sheets] Fetched ${rmtRows.length} rows from RMT, ${totalRows.length} rows from TOTAL GOLD PER ID.`);

  // 3. Parse TOTAL GOLD PER ID (October monthly gold for all trainees)
  const allOctober = new Map();

  for (let r = 3; r < totalRows.length; r++) {
    const row = totalRows[r];
    if (!row || row.length < 8) continue;
    const tid = String(row[0] || '').trim();
    if (!tid || tid === 'ID') continue;

    const name = String(row[1] || '').trim();
    const status = String(row[2] || '').trim() || 'Active';
    const level = String(row[3] || '').trim();
    const house = String(row[4] || '').trim();
    const cls = String(row[5] || '').trim();
    const branch = String(row[6] || '').trim();
    const gp = String(row[7] || '0').trim();
    const jyRaw = String(row[8] || '').trim();

    let coreOrator = jyRaw;
    if (jyRaw.toLowerCase() === 'junior' || jyRaw.toLowerCase() === 'core') coreOrator = 'Core';
    else if (jyRaw.toLowerCase() === 'youth' || jyRaw.toLowerCase() === 'orator') coreOrator = 'Orator';

    const rankCore = String(row[9] || '').trim();
    const rankOrator = String(row[10] || '').trim();
    const rankCoreCemara = String(row[15] || '').trim();
    const rankOratorCemara = String(row[16] || '').trim();

    const prof = profileMap.get(tid);

    allOctober.set(tid, {
      id: tid,
      name: name || (prof ? prof.name : ''),
      status: status || (prof ? prof.membership : 'Active'),
      level: level || (prof ? prof.level : ''),
      house: house || (prof ? prof.house : ''),
      class: cls || (prof ? prof.class : ''),
      branch: branch,
      total_gold: gp,
      core_orator: coreOrator,
      rank_core: rankCore,
      rank_orator: rankOrator,
      rank_core_cemara: rankCoreCemara,
      rank_orator_cemara: rankOratorCemara
    });
  }

  // 4. Overlay & enrich with all 8 blocks in RESULT MONTH TRAINEE
  const blocksInfo = [
    { name: 'ALL_BRANCH_JUNIOR', col: 0, rank_col: 9, cat: 'Core', branch: 'ALL' },
    { name: 'ALL_BRANCH_YOUTH', col: 11, rank_col: 21, cat: 'Orator', branch: 'ALL' },
    { name: 'TIMOR_JUNIOR', col: 23, rank_col: 32, cat: 'Core', branch: 'TIMOR' },
    { name: 'TIMOR_YOUTH', col: 36, rank_col: 48, cat: 'Orator', branch: 'TIMOR' },
    { name: 'TRITURA_JUNIOR', col: 50, rank_col: 63, cat: 'Core', branch: 'TRITURA' },
    { name: 'TRITURA_YOUTH', col: 65, rank_col: 79, cat: 'Orator', branch: 'TRITURA' },
    { name: 'CEMARA_JUNIOR', col: 81, rank_col: 96, cat: 'Core', branch: 'CEMARA' },
    { name: 'CEMARA_YOUTH', col: 98, rank_col: 114, cat: 'Orator', branch: 'CEMARA' }
  ];

  for (const b of blocksInfo) {
    const c = b.col;
    const rc = b.rank_col;
    for (let r = 6; r < rmtRows.length; r++) {
      const row = rmtRows[r];
      if (!row || c >= row.length) continue;
      const tid = String(row[c] || '').trim();
      if (!tid || tid === 'ID') continue;

      const name = String(row[c + 1] || '').trim();
      const status = String(row[c + 2] || '').trim();
      const level = String(row[c + 3] || '').trim();
      const house = String(row[c + 4] || '').trim();
      const cls = String(row[c + 5] || '').trim();
      const branch = String(row[c + 6] || '').trim();
      const gp = String(row[c + 7] || '0').trim();
      const rank = String(row[rc] || '').trim();

      const prof = profileMap.get(tid);

      if (!allOctober.has(tid)) {
        allOctober.set(tid, {
          id: tid,
          name: name || (prof ? prof.name : ''),
          status: status || (prof ? prof.membership : 'Active'),
          level: level || (prof ? prof.level : ''),
          house: house || (prof ? prof.house : ''),
          class: cls || (prof ? prof.class : ''),
          branch: branch,
          total_gold: gp,
          core_orator: b.cat,
          rank_core: '',
          rank_orator: '',
          rank_core_cemara: '',
          rank_orator_cemara: ''
        });
      }

      const rec = allOctober.get(tid);
      if (name) rec.name = name;
      if (status) rec.status = status;
      if (level) rec.level = level;
      if (house) rec.house = house;
      if (cls) rec.class = cls;
      if (branch) rec.branch = branch;
      if (gp) rec.total_gold = gp;
      rec.core_orator = b.cat;

      if (b.name === 'ALL_BRANCH_JUNIOR') rec.rank_core = rank;
      else if (b.name === 'ALL_BRANCH_YOUTH') rec.rank_orator = rank;
      else if (b.name === 'CEMARA_JUNIOR') rec.rank_core_cemara = rank;
      else if (b.name === 'CEMARA_YOUTH') rec.rank_orator_cemara = rank;
    }
  }

  // Fill empty metadata from profile_trainee
  for (const rec of allOctober.values()) {
    if (!rec.house && profileMap.has(rec.id)) rec.house = profileMap.get(rec.id).house || '';
    if (!rec.class && profileMap.has(rec.id)) rec.class = profileMap.get(rec.id).class || '';
    if (!rec.level && profileMap.has(rec.id)) rec.level = profileMap.get(rec.id).level || '';
    if (!rec.name && profileMap.has(rec.id)) rec.name = profileMap.get(rec.id).name || '';
  }

  const traineesList = Array.from(allOctober.values());
  traineesList.sort((a, b) => (parseFloat(b.total_gold) || 0) - (parseFloat(a.total_gold) || 0));

  // 5. Update Neon PostgreSQL monthly_gold_point
  console.log('[3/5] Updating Neon PostgreSQL monthly_gold_point...');
  if (process.env.DATABASE_URL) {
    const neonPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await neonPool.query(`
        CREATE TABLE IF NOT EXISTS monthly_gold_point (
          "ID" VARCHAR(255) PRIMARY KEY,
          "Nama Trainee" VARCHAR(255),
          "Active/Expired" VARCHAR(100),
          "Level" VARCHAR(100),
          "House" VARCHAR(100),
          "Class" VARCHAR(100),
          "Branch" VARCHAR(100),
          "Total Gold/Periode" VARCHAR(100),
          "Core/Orator" VARCHAR(100),
          "RANK/ID/Core" VARCHAR(255),
          "RANK/ID/Orator" VARCHAR(255),
          "RANK/ID/Core/Cemara" VARCHAR(255),
          "RANK/ID/Orator/CEMARA" VARCHAR(255)
        )
      `);
      await neonPool.query('TRUNCATE TABLE monthly_gold_point');
      for (let i = 0; i < traineesList.length; i += 50) {
        const chunk = traineesList.slice(i, i + 50);
        const values = [];
        const placeholders = [];
        chunk.forEach((t, cIdx) => {
          const offset = cIdx * 13;
          placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13})`);
          values.push(
            t.id, t.name, t.status, t.level, t.house, t.class, t.branch,
            t.total_gold, t.core_orator, t.rank_core, t.rank_orator,
            t.rank_core_cemara, t.rank_orator_cemara
          );
        });
        await neonPool.query(`
          INSERT INTO monthly_gold_point (
            "ID", "Nama Trainee", "Active/Expired", "Level", "House", "Class", "Branch",
            "Total Gold/Periode", "Core/Orator", "RANK/ID/Core", "RANK/ID/Orator",
            "RANK/ID/Core/Cemara", "RANK/ID/Orator/CEMARA"
          ) VALUES ${placeholders.join(', ')}
        `, values);
      }
      console.log(`[Neon] Successfully inserted ${traineesList.length} rows.`);
    } catch (err) {
      console.error('[Neon] Sync error:', err.message);
    } finally {
      await neonPool.end();
    }
  }

  // 6. Update Hostinger MySQL monthly_gold_point
  console.log('[4/5] Updating Hostinger MySQL monthly_gold_point...');
  try {
    await mysql.query('TRUNCATE TABLE monthly_gold_point');
    for (let i = 0; i < traineesList.length; i += 50) {
      const chunk = traineesList.slice(i, i + 50);
      const values = [];
      const placeholders = [];
      chunk.forEach((t) => {
        placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        values.push(
          t.id, t.name, t.status, t.level, t.house, t.class, t.branch,
          t.total_gold, t.core_orator, t.rank_core, t.rank_orator,
          t.rank_core_cemara, t.rank_orator_cemara
        );
      });
      await mysql.query(`
        INSERT INTO monthly_gold_point (
          \`ID\`, \`Nama Trainee\`, \`Active/Expired\`, \`Level\`, \`House\`, \`Class\`, \`Branch\`,
          \`Total Gold/Periode\`, \`Core/Orator\`, \`RANK/ID/Core\`, \`RANK/ID/Orator\`,
          \`RANK/ID/Core/Cemara\`, \`RANK/ID/Orator/CEMARA\`
        ) VALUES ${placeholders.join(', ')}
      `, values);
    }
    console.log(`[MySQL] Successfully inserted ${traineesList.length} rows.`);
  } catch (err) {
    console.error('[MySQL] Sync error:', err.message);
  }

  // 7. Update Hostinger MySQL trainee_gold_summary (total_gold_perbulan)
  console.log('[5/5] Updating trainee_gold_summary table in Hostinger MySQL...');
  try {
    await mysql.query('UPDATE trainee_gold_summary SET total_gold_perbulan = 0');
    for (const t of traineesList) {
      const gpNum = parseInt(String(t.total_gold).replace(/[^0-9]/g, ''), 10) || 0;
      await mysql.query(`
        INSERT INTO trainee_gold_summary (id, name, membership, total_gold_pertahun, total_gold_perbulan, total_gold_perterm)
        VALUES (?, ?, ?, 0, ?, 0)
        ON DUPLICATE KEY UPDATE
          total_gold_perbulan = VALUES(total_gold_perbulan),
          name = IF(VALUES(name) != '', VALUES(name), name),
          membership = IF(VALUES(membership) != '', VALUES(membership), membership)
      `, [t.id, t.name, t.status, gpNum]);
    }
    console.log(`[MySQL] Successfully updated total_gold_perbulan for ${traineesList.length} trainees.`);
  } catch (err) {
    console.error('[MySQL] Error updating trainee_gold_summary:', err.message);
  }

  console.log('=== [SYNC COMPLETED] ===');
}

if (require.main === module) {
  syncMonthlyGoldPoints().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = syncMonthlyGoldPoints;
