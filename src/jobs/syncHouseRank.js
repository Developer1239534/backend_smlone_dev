const { google } = require('googleapis');
const mysql = require('/root/backend_smlone_dev/src/db/mysqlClient');
const neon = require('/root/backend_smlone_dev/src/db/neonClient');

// MASTERFILE PORTAL - SINGLE SOURCE OF TRUTH (Tab: House Rank Dan Class)
const SPREADSHEET_ID = '14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU';
const RANGE = 'House Rank Dan Class!A2:F7';

// Member counts per house from Masterfile Portal table E & F
const MEMBER_LOOKUP = {
  'THENOVA': 270,
  'HAVARIA': 163,
  'REVERION': 52,
  'QUORION': 103,
  'CREANOVA': 56
};

async function syncHouseRank() {
  console.log('[Sync House Rank] Mengambil data House Rank langsung dari Masterfile Portal...');
  console.log(`Sheet ID: ${SPREADSHEET_ID} (Tab: House Rank Dan Class)`);

  const auth = new google.auth.GoogleAuth({
    keyFile: '/root/service_account_n8n.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueRenderOption: 'FORMATTED_VALUE'
  });

  const rows = res.data.values || [];
  console.log(`[Sync House Rank] Berhasil membaca ${rows.length} baris dari Masterfile Portal.`);

  // 1. Build dynamic memberMap from Col E & F if present
  const dynamicMemberMap = { ...MEMBER_LOOKUP };
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const eName = String(r[4] || '').trim().toUpperCase();
    const fCount = parseInt(String(r[5] || '0').replace(/[^0-9]/g, ''), 10);
    if (eName && fCount > 0) {
      dynamicMemberMap[eName] = fCount;
    }
  }

  // 2. Parse house metrics from Col A, B, C, D
  const houseData = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rawHouseName = (r[0] || '').trim();
    if (!rawHouseName || !rawHouseName.startsWith('House of')) continue;

    const shortName = rawHouseName.replace(/^House of\s+/i, '').trim().toUpperCase();
    const rawTotalGold = parseInt(String(r[1] || '0').replace(/[^0-9]/g, ''), 10) || 0;
    
    // Look up member count for THIS house
    const members = dynamicMemberMap[shortName] || MEMBER_LOOKUP[shortName] || 1;

    // Col D is Average Amount Members : Total GP House
    let dividedGold = parseInt(String(r[3] || '0').replace(/[^0-9]/g, ''), 10);
    if (!dividedGold || isNaN(dividedGold)) {
      dividedGold = Math.round(rawTotalGold / members);
    }

    const avgFloat = parseFloat((rawTotalGold / members).toFixed(2));

    houseData.push({
      house: rawHouseName,
      shortName,
      rawTotalGold,
      members,
      dividedGold,
      avgFloat
    });
  }

  // Sort by dividedGold descending (sesuai aturan pembagian poin per member)
  houseData.sort((a, b) => b.dividedGold - a.dividedGold);
  houseData.forEach((h, idx) => {
    h.rank = idx + 1;
  });

  console.log('[Sync House Rank] Hasil kalkulasi presisi dari Masterfile Portal:');
  console.table(houseData);

  // Update ke MariaDB dan Neon PG
  for (const h of houseData) {
    const finalGoldStr = String(h.dividedGold);
    const rankStr = String(h.rank);

    // Update MariaDB
    await mysql.query(`
      INSERT INTO house_rank (
        \`HOUSE\`, \`TOTAL GOLD/HOUSE\`, \`RANK\`, \`TOTAL_MEMBERS\`, \`AVG_GOLD\`, \`RANK_AVG\`
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`TOTAL GOLD/HOUSE\` = VALUES(\`TOTAL GOLD/HOUSE\`),
        \`RANK\` = VALUES(\`RANK\`),
        \`TOTAL_MEMBERS\` = VALUES(\`TOTAL_MEMBERS\`),
        \`AVG_GOLD\` = VALUES(\`AVG_GOLD\`),
        \`RANK_AVG\` = VALUES(\`RANK_AVG\`)
    `, [h.house, finalGoldStr, rankStr, h.members, h.avgFloat, h.rank]);

    // Update Neon PostgreSQL
    try {
      await neon.query(`
        INSERT INTO house_rank (
          "HOUSE", "TOTAL GOLD/HOUSE", "RANK", "TOTAL_MEMBERS", "AVG_GOLD", "RANK_AVG"
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("HOUSE") DO UPDATE SET
          "TOTAL GOLD/HOUSE" = EXCLUDED."TOTAL GOLD/HOUSE",
          "RANK" = EXCLUDED."RANK",
          "TOTAL_MEMBERS" = EXCLUDED."TOTAL_MEMBERS",
          "AVG_GOLD" = EXCLUDED."AVG_GOLD",
          "RANK_AVG" = EXCLUDED."RANK_AVG"
      `, [h.house, finalGoldStr, rankStr, h.members, h.avgFloat, h.rank]);
    } catch (neonErr) {
      console.warn(`[Neon Warning] ${h.house}:`, neonErr.message);
    }
  }

  console.log('✅ [Sync House Rank] Sinkronisasi House Rank dari Masterfile Portal sukses diperbarui ke MariaDB & Neon PG!');
  return houseData;
}

if (require.main === module) {
  syncHouseRank()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error saat sync:', err);
      process.exit(1);
    });
}

module.exports = { syncHouseRank };
