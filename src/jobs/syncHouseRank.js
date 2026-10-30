const https = require('https');
const db = require('/root/backend_smlone_dev/src/db/mysqlClient');

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1JMhLNw-DIJCCkK_RBhPBp61sQZTMNkzYhPgxE_WLnlU/gviz/tq?tqx=out:csv&gid=154343977';

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i+1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function syncHouseRank() {
  console.log('[Sync House Rank] Fetching latest data from Master Sheet...');
  const csvData = await fetchCSV(sheetUrl);
  const lines = csvData.split('\n').map(l => l.trim()).filter(Boolean);

  const updates = [];
  for (let i = 3; i <= 7; i++) {
    if (lines[i]) {
      const cols = parseCSVLine(lines[i]);
      const house = cols[0];
      const rawGold = parseInt(cols[1] || '0', 10);
      const className = cols[3];
      const cabang = cols[4];
      const program = cols[5];
      const rankCore = cols[6] || '';
      const rankOrator = cols[7] || '';
      const totalMembers = parseInt(cols[14] || '0', 10);
      const finalGold = totalMembers > 0 ? Math.round(rawGold / totalMembers) : rawGold;
      if (house && house.startsWith('House of')) {
        updates.push({ house, totalGold: String(finalGold), finalGold, className, cabang, program, rankCore, rankOrator, totalMembers });
      }
    }
  }

  // Sort by finalGold descending to re-rank cleanly
  updates.sort((a, b) => b.finalGold - a.finalGold);
  updates.forEach((u, idx) => {
    u.rank = String(idx + 1);
  });

  console.log(`[Sync House Rank] Found ${updates.length} houses from sheet (Divided & Rounded Integer):`);
  for (const u of updates) {
    console.log(`  - Rank ${u.rank}: ${u.house} (${u.totalGold} GP [Bulat] | ${u.totalMembers} Members) | Class: ${u.className}`);
    await db.query(`
      INSERT INTO house_rank (
        \`HOUSE\`, \`TOTAL GOLD/HOUSE\`, \`RANK\`, \`CLASS\`, \`CABANG\`, \`PROGRAM\`, \`RANK/CORE\`, \`RANK/ORATOR\`, \`TOTAL_MEMBERS\`, \`AVG_GOLD\`, \`RANK_AVG\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
      ON DUPLICATE KEY UPDATE
        \`TOTAL GOLD/HOUSE\` = VALUES(\`TOTAL GOLD/HOUSE\`),
        \`RANK\` = VALUES(\`RANK\`),
        \`CLASS\` = VALUES(\`CLASS\`),
        \`CABANG\` = VALUES(\`CABANG\`),
        \`PROGRAM\` = VALUES(\`PROGRAM\`),
        \`RANK/CORE\` = VALUES(\`RANK/CORE\`),
        \`RANK/ORATOR\` = VALUES(\`RANK/ORATOR\`)
    `, [u.house, u.totalGold, u.rank, u.className, u.cabang, u.program, u.rankCore, u.rankOrator]);
  }

  console.log('[Sync House Rank] Sync successfully written to MySQL database!');
  process.exit(0);
}

if (require.main === module) {
  syncHouseRank().catch(err => {
    console.error('Error syncing house rank:', err);
    process.exit(1);
  });
}

module.exports = { syncHouseRank };
