/**
 * SMLONE Automated Mirror Job:
 * Ensures 'Profile Trainee Portal' in Master Spreadsheet (14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU, gid: 857520896)
 * has 25 columns matching database profile_trainee, with standardized branch names:
 * 'SMLONE Cemara Asri', 'SMLONE Timor', 'SMLONE Tritura'
 */

const fs = require('fs');
const db = require('../db/neonClient');

const CREDS_PATH = '/root/sa_creds.json';
const SOURCE_SPREADSHEET_ID = '15BgGHL9Pf_TggQHpLihi963plxK-w6i7CzhAhxXYcwQ';
const TARGET_SPREADSHEET_ID = '14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU';

const COLUMNS = [
  'Class',
  'Day',
  'Time',
  'Room',
  'Branch',
  'ID',
  'Name',
  'Level',
  'HOUSE',
  'House Role',
  'Trainee Homeroom',
  'Homeroom kelas',
  'Trainer',
  'MEMBERSHIP',
  'EXPIRY DATE',
  'FIRST ENROLL',
  'Date of Birth',
  'Class in School',
  'Parents Email Account',
  'Trainee Email Account',
  'Parent WhatsApp Number',
  'Trainee WhatsApp Number',
  'School Name',
  'Program',
  'avatar_url',
  'Gold Point per Term'
];

function normalizeBranch(raw) {
  if (!raw) return '';
  const s = raw.trim().toLowerCase();
  if (s.includes('cemara')) return 'SMLONE Cemara Asri';
  if (s.includes('timor') || s.includes('centre point') || s.includes('center point')) return 'SMLONE Timor';
  if (s.includes('tritura')) return 'SMLONE Tritura';
  return raw.trim();
}

async function getAccessToken() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  const postData = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: creds.oauthTokenData.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: postData
  });
  const json = await tokenRes.json();
  if (!json.access_token) {
    throw new Error('Failed to obtain Google access token: ' + JSON.stringify(json));
  }
  return json.access_token;
}

async function runProfileTraineeReconciliation() {
  const token = await getAccessToken();
  const authHeader = { Authorization: 'Bearer ' + token };

  // Fetch Source (CLASS AND TRAINEE)
  const resSrc = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SOURCE_SPREADSHEET_ID}/values/'CLASS AND TRAINEE'!A3:Q`, {
    headers: authHeader
  });
  const srcJson = await resSrc.json();
  const srcRows = srcJson.values || [];
  if (srcRows.length < 2) {
    console.log('[Profile Trainee Reconciler] Source data appears empty. Skipping.');
    return;
  }

  const srcHeader = srcRows[0];
  const srcData = srcRows.slice(1);

  // Fetch Target (Profile Trainee Portal)
  const resTgt = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}/values/'Profile Trainee Portal'!A1:B`, {
    headers: authHeader
  });
  const tgtJson = await resTgt.json();
  const tgtRows = tgtJson.values || [];
  const currentTargetDataCount = Math.max(0, tgtRows.length - 1);

  console.log(`[Profile Trainee Reconciler] Source rows: ${srcData.length} | Target rows: ${currentTargetDataCount}`);

  if (srcData.length === currentTargetDataCount) {
    console.log('[Profile Trainee Reconciler] Row count is in 100% exact parity.');
    return;
  }

  console.log(`[Profile Trainee Reconciler] Discrepancy detected. Auto-correcting with standardized branch names...`);

  // Fetch DB records for enrichment
  const dbRes = await db.query('SELECT * FROM profile_trainee');
  const dbMap = {};
  dbRes.rows.forEach(r => {
    if (r.ID) dbMap[String(r.ID).trim()] = r;
  });

  const colIdx = {
    Class: srcHeader.indexOf('Class'),
    Day: srcHeader.indexOf('Day'),
    Time: srcHeader.indexOf('Time'),
    Room: srcHeader.indexOf('Room'),
    Branch: srcHeader.indexOf('Branch'),
    ID: srcHeader.indexOf('ID'),
    Name: srcHeader.indexOf('Name'),
    Level: srcHeader.indexOf('Level'),
    HOUSE: srcHeader.indexOf('HOUSE'),
    HouseRole: srcHeader.indexOf('House Role'),
    TraineeHomeroom: srcHeader.indexOf('Trainee Homeroom'),
    HomeroomKelas: srcHeader.indexOf('Homeroom kelas'),
    Trainer: srcHeader.indexOf('Trainer'),
    MEMBERSHIP: srcHeader.indexOf('MEMBERSHIP'),
    EXPIRYDATE: srcHeader.indexOf('EXPIRY DATE'),
    FIRSTENROLL: srcHeader.indexOf('FIRST ENROLL')
  };

  const targetRows = srcData.map(r => {
    const id = String(r[colIdx.ID] || '').trim();
    const dbItem = dbMap[id] || {};
    const rawBranch = r[colIdx.Branch] || dbItem.Branch || '';
    const branch = normalizeBranch(rawBranch);

    return [
      r[colIdx.Class] || dbItem.Class || '',
      r[colIdx.Day] || dbItem.Day || '',
      r[colIdx.Time] || dbItem.Time || '',
      r[colIdx.Room] || dbItem.Room || '',
      branch,
      id,
      r[colIdx.Name] || dbItem.Name || '',
      r[colIdx.Level] || dbItem.Level || '',
      r[colIdx.HOUSE] || dbItem.HOUSE || '',
      r[colIdx.HouseRole] || dbItem['House Role'] || '',
      r[colIdx.TraineeHomeroom] || dbItem['Trainee Homeroom'] || '',
      r[colIdx.HomeroomKelas] || dbItem['Homeroom kelas'] || '',
      r[colIdx.Trainer] || dbItem.Trainer || '',
      r[colIdx.MEMBERSHIP] || dbItem.MEMBERSHIP || '',
      r[colIdx.EXPIRYDATE] || dbItem['EXPIRY DATE'] || '',
      r[colIdx.FIRSTENROLL] || dbItem['FIRST ENROLL'] || '',
      dbItem['Date of Birth'] || '',
      dbItem['Class in School'] || '',
      dbItem['Parents Email Account'] || '',
      dbItem['Trainee Email Account'] || '',
      dbItem['Parent WhatsApp Number'] || '',
      dbItem['Trainee WhatsApp Number'] || '',
      dbItem['School Name'] || '',
      dbItem.Program || '-',
      dbItem.avatar_url || '',
      dbItem['Gold Point per Term'] || '0'
    ];
  });

  // Clear Target
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}/values/'Profile Trainee Portal'!A1:Z2500:clear`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' }
  });

  // Write exact headers and rows
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${TARGET_SPREADSHEET_ID}/values/'Profile Trainee Portal'!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      range: "'Profile Trainee Portal'!A1",
      majorDimension: 'ROWS',
      values: [COLUMNS, ...targetRows]
    })
  });

  console.log(`[Profile Trainee Reconciler] Reconciled: exactly ${targetRows.length} data rows with standardized branch names.`);
}

if (require.main === module) {
  runProfileTraineeReconciliation()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Profile Trainee Reconciler] Error:', err.message);
      process.exit(1);
    });
}

module.exports = { runProfileTraineeReconciliation };
