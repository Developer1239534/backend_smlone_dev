const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-gold-points.txt');

async function main() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ Data file not found at: ${dataFilePath}`);
      process.exit(1);
    }

    console.log(`Parsing file: ${path.basename(dataFilePath)}`);
    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');

    // Parse period (Month) dynamically
    let periode = '6/30/2026';
    const monthLine = lines.find(l => l.includes('Month'));
    if (monthLine) {
      const mParts = monthLine.split(/\t/);
      if (mParts.length >= 2 && mParts[1].trim()) {
        periode = mParts[1].trim();
      } else {
        const mTokens = monthLine.trim().split(/\s+/);
        if (mTokens.length >= 2) {
          periode = mTokens[1];
        }
      }
    }
    console.log(`Parsed Period (Month): ${periode}`);

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('ID\t') || lines[i].startsWith('ID ')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      console.error('❌ Could not find header line starting with ID');
      process.exit(1);
    }

    console.log(`Found header line at index ${headerIndex}`);
    const headerLine = lines[headerIndex];
    const headerCols = headerLine.split('\t').map(c => c.trim());
    
    const idIndices = [];
    headerCols.forEach((col, idx) => {
      if (col === 'ID') {
        idIndices.push(idx);
      }
    });

    const tables = [
      { name: 'rank_id_junior', startCol: idIndices[0] },
      { name: 'rank_id_youth', startCol: idIndices[1] },
      { name: 'rank_id_junior_timor', startCol: idIndices[2] },
      { name: 'rank_id_youth_timor', startCol: idIndices[3] },
      { name: 'rank_id_junior_tritura', startCol: idIndices[4] },
      { name: 'rank_id_youth_tritura', startCol: idIndices[5] },
      { name: 'rank_id_junior_cemara', startCol: idIndices[6] },
      { name: 'rank_id_youth_cemara', startCol: idIndices[7] }
    ];

    // Find offsets dynamically for each table
    tables.forEach((t, index) => {
      const nextStart = idIndices[index + 1] || headerCols.length;
      
      let nameOffset = 1;
      let statusOffset = 2;
      let levelOffset = 3;
      let houseOffset = 4;
      let classOffset = 5;
      let branchOffset = 6;
      let goldOffset = 7;
      let jyOffset = 8;
      let rankOffset = 9;

      for (let c = t.startCol; c < nextStart; c++) {
        const h = headerCols[c];
        if (h === 'Nama Trainee') nameOffset = c - t.startCol;
        if (h === 'Active/Expired') statusOffset = c - t.startCol;
        if (h === 'Level') levelOffset = c - t.startCol;
        if (h === 'House') houseOffset = c - t.startCol;
        if (h === 'Class') classOffset = c - t.startCol;
        if (h === 'Branch') branchOffset = c - t.startCol;
        if (h === 'Total Gold/Periode') goldOffset = c - t.startCol;
        if (h === 'Junior/Youth') jyOffset = c - t.startCol;
        if (h === 'RANK/ID') rankOffset = c - t.startCol;
      }

      t.nameOffset = nameOffset;
      t.statusOffset = statusOffset;
      t.levelOffset = levelOffset;
      t.houseOffset = houseOffset;
      t.classOffset = classOffset;
      t.branchOffset = branchOffset;
      t.goldOffset = goldOffset;
      t.jyOffset = jyOffset;
      t.rankOffset = rankOffset;
      t.endCol = nextStart;
    });

    console.log('Dynamic offsets computed for all 8 tables.');

    const traineeMap = {};

    // Parse data rows (starting from line after header)
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      if (
        line.startsWith('<USER_REQUEST>') || 
        line.startsWith('</USER_REQUEST>') || 
        line.startsWith('<ADDITIONAL_METADATA>') ||
        line.startsWith('</ADDITIONAL_METADATA>') ||
        line.includes('jika ada ID tidak ada') ||
        line.includes('The current local time is') ||
        line.includes('NOTE: The output was truncated') ||
        line.includes('<truncated')
      ) {
        continue;
      }

      const cols = line.split('\t');

      tables.forEach(t => {
        if (t.startCol >= cols.length) return;
        const rawId = cols[t.startCol] ? cols[t.startCol].trim() : '';
        if (!rawId || isNaN(rawId)) return;

        let id = rawId;
        // Map 968 to 966
        if (id === '968') {
          id = '966';
        }

        const name = cols[t.startCol + t.nameOffset] ? cols[t.startCol + t.nameOffset].trim() : '';
        const statusRaw = cols[t.startCol + t.statusOffset] ? cols[t.startCol + t.statusOffset].trim() : 'Active';
        const level = cols[t.startCol + t.levelOffset] ? cols[t.startCol + t.levelOffset].trim() : '';
        const house = cols[t.startCol + t.houseOffset] ? cols[t.startCol + t.houseOffset].trim() : '';
        const classStr = cols[t.startCol + t.classOffset] ? cols[t.startCol + t.classOffset].trim() : '';
        const branch = cols[t.startCol + t.branchOffset] ? cols[t.startCol + t.branchOffset].trim() : '';
        const gold = cols[t.startCol + t.goldOffset] ? cols[t.startCol + t.goldOffset].trim() : '';
        const jy = cols[t.startCol + t.jyOffset] ? cols[t.startCol + t.jyOffset].trim() : '';
        const rank = cols[t.startCol + t.rankOffset] ? cols[t.startCol + t.rankOffset].trim() : '';

        // Clean status
        let status = 'Active';
        if (statusRaw.toLowerCase().includes('expired')) {
          status = 'Expired';
        } else if (statusRaw.toLowerCase().includes('grace')) {
          status = 'Active (Grace Period)';
        }

        if (!traineeMap[id]) {
          traineeMap[id] = {
            id,
            name,
            status,
            level,
            house,
            class: classStr,
            branch,
            total_gold_periode: gold,
            junior_youth: jy,
            ranks: {}
          };
        } else {
          // Keep highest gold if multiple exist
          if (gold && (!traineeMap[id].total_gold_periode || Number(gold) > Number(traineeMap[id].total_gold_periode))) {
            traineeMap[id].total_gold_periode = gold;
          }
          if (jy && !traineeMap[id].junior_youth) {
            traineeMap[id].junior_youth = jy;
          }
        }

        if (rank) {
          traineeMap[id].ranks[t.name] = rank;
        }
      });
    }

    const uniqueIds = Object.keys(traineeMap);
    console.log(`Parsed ${uniqueIds.length} unique trainees from Top 25 tables.`);

    // 1. Clear existing ranks in gp_month for this period
    console.log(`Clearing existing gp_month records for period: ${periode}...`);
    await db.query('DELETE FROM gp_month WHERE periode = $1', [periode]);

    // 2. Process each parsed trainee
    let registeredCount = 0;
    let updatedCount = 0;

    for (const id of uniqueIds) {
      const t = traineeMap[id];

      // Check if trainee exists in dashboard_trainne
      const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        // Auto-register missing trainee
        const plainPassword = `smlone${id}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        await db.query(`
          INSERT INTO dashboard_trainne (
            id, trainee_name, status, level, class, cabang, house_sml, junior_youth, password, plain_password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [id, t.name, t.status, t.level, t.class, t.branch, t.house, t.junior_youth, hashedPassword, plainPassword]);
        
        registeredCount++;
        console.log(`👤 Registered missing trainee: ID ${id} (${t.name})`);
      }

      // Insert/Update gp_month
      await db.query(`
        INSERT INTO gp_month (
          trainee_id, periode, total_gold_periode,
          rank_id_junior, rank_id_youth,
          rank_id_junior_timor, rank_id_youth_timor,
          rank_id_junior_tritura, rank_id_youth_tritura,
          rank_id_junior_cemara, rank_id_youth_cemara
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (trainee_id) DO UPDATE SET
          periode = EXCLUDED.periode,
          total_gold_periode = EXCLUDED.total_gold_periode,
          rank_id_junior = EXCLUDED.rank_id_junior,
          rank_id_youth = EXCLUDED.rank_id_youth,
          rank_id_junior_timor = EXCLUDED.rank_id_junior_timor,
          rank_id_youth_timor = EXCLUDED.rank_id_youth_timor,
          rank_id_junior_tritura = EXCLUDED.rank_id_junior_tritura,
          rank_id_youth_tritura = EXCLUDED.rank_id_youth_tritura,
          rank_id_junior_cemara = EXCLUDED.rank_id_junior_cemara,
          rank_id_youth_cemara = EXCLUDED.rank_id_youth_cemara
      `, [
        id, periode, t.total_gold_periode,
        t.ranks.rank_id_junior || null, t.ranks.rank_id_youth || null,
        t.ranks.rank_id_junior_timor || null, t.ranks.rank_id_youth_timor || null,
        t.ranks.rank_id_junior_tritura || null, t.ranks.rank_id_youth_tritura || null,
        t.ranks.rank_id_junior_cemara || null, t.ranks.rank_id_youth_cemara || null
      ]);

      updatedCount++;
    }

    console.log(`\n===========================================`);
    console.log(`   GOLD POINTS & RANKINGS SYNC COMPLETED`);
    console.log(`===========================================`);
    console.log(`Period:                           ${periode}`);
    console.log(`Total unique trainees updated:    ${updatedCount}`);
    console.log(`Trainees auto-registered:         ${registeredCount}`);
    console.log(`===========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Sync error:', err);
    process.exit(1);
  }
}

main();
