#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const db = require('/root/backend_smlone_dev/src/db/mysqlClient');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Ed60KEQ5gWeKMZcUSs2sPlW7Ua4qruwhjyKf_cclooI/export?format=csv&gid=264691834';

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchCsv(res.headers.location));
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

async function syncCurriculumFromSheet() {
  console.log(`[${new Date().toISOString()}] Starting auto-sync from Report Link sheet...`);
  try {
    const csvData = await fetchCsv(SHEET_URL);
    const rawLines = csvData.split(/\r?\n/);
    if (rawLines.length < 3) {
      console.warn('CSV data too short');
      return;
    }

    const rows = rawLines.slice(2);
    let count = 0;

    for (const line of rows) {
      if (!line.trim()) continue;
      const r = parseCSVLine(line);
      if (r.length < 2) continue;

      const sid = (r[0] || '').trim();
      const name = (r[1] || '').trim();
      if (!sid) continue;

      const level = (r[12] || '').trim();
      const sp_pct = (r[72] || '0%').trim();
      const discipline = (r[73] || '0%').trim();
      const family_life = (r[74] || '0%').trim();
      const school_life = (r[75] || '0%').trim();
      const basic_manner = (r[76] || '0%').trim();
      const survival_skill = (r[77] || '0%').trim();
      const appreciation = (r[78] || '0%').trim();
      const free_project = (r[79] || '0%').trim();
      const life_pct = (r[80] || '0%').trim();

      const sp_1 = (r[82] || '0').trim();
      const sp_2 = (r[83] || '0').trim();
      const sp_3 = (r[84] || '0').trim();
      const sp_4 = (r[85] || '0').trim();
      const sp_5 = (r[86] || '0').trim();
      const sp_6 = (r[87] || '0').trim();
      const sp_7 = (r[88] || '0').trim();
      const sp_8 = (r[89] || '0').trim();
      const sp_9 = (r[90] || '0').trim();
      const sp_10 = (r[91] || '0').trim();

      const last_speaker_date = (r[119] || '').trim();
      const last_lp_date = (r[120] || '').trim();
      const last_lp = (r[121] || '').trim();
      const last_att = (r[122] || '').trim();

      await db.query(`
        INSERT INTO student_curriculum_progress (
          student_id, name, level, speaking_pct, life_pct,
          discipline, family_life, school_life, basic_manner, survival_skill, appreciation, free_project,
          sp_1, sp_2, sp_3, sp_4, sp_5, sp_6, sp_7, sp_8, sp_9, sp_10,
          last_speaker_date, last_life_project_date, last_life_project, last_attendance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          level = VALUES(level),
          speaking_pct = VALUES(speaking_pct),
          life_pct = VALUES(life_pct),
          discipline = VALUES(discipline),
          family_life = VALUES(family_life),
          school_life = VALUES(school_life),
          basic_manner = VALUES(basic_manner),
          survival_skill = VALUES(survival_skill),
          appreciation = VALUES(appreciation),
          free_project = VALUES(free_project),
          sp_1 = VALUES(sp_1),
          sp_2 = VALUES(sp_2),
          sp_3 = VALUES(sp_3),
          sp_4 = VALUES(sp_4),
          sp_5 = VALUES(sp_5),
          sp_6 = VALUES(sp_6),
          sp_7 = VALUES(sp_7),
          sp_8 = VALUES(sp_8),
          sp_9 = VALUES(sp_9),
          sp_10 = VALUES(sp_10),
          last_speaker_date = VALUES(last_speaker_date),
          last_life_project_date = VALUES(last_life_project_date),
          last_life_project = VALUES(last_life_project),
          last_attendance = VALUES(last_attendance)
      `, [
        sid, name, level, sp_pct, life_pct,
        discipline, family_life, school_life, basic_manner, survival_skill, appreciation, free_project,
        sp_1, sp_2, sp_3, sp_4, sp_5, sp_6, sp_7, sp_8, sp_9, sp_10,
        last_speaker_date, last_lp_date, last_lp, last_att
      ]);
      count++;
    }

    console.log(`[${new Date().toISOString()}] Successfully synced ${count} students curriculum progress from Google Sheet!`);
  } catch (err) {
    console.error('Error syncing curriculum progress:', err.message);
  }
}

if (require.main === module) {
  syncCurriculumFromSheet().then(() => process.exit(0));
}

module.exports = { syncCurriculumFromSheet };
