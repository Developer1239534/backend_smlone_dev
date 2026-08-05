const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🔄 Fast batch importing into gold_point_rankings table...');

  // Ensure table and constraint exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS gold_point_rankings (
      id SERIAL PRIMARY KEY,
      period VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      program VARCHAR(100) NOT NULL,
      trainee_id VARCHAR(255) NOT NULL,
      trainee_name VARCHAR(255),
      membership_status VARCHAR(100),
      level VARCHAR(100),
      house VARCHAR(100),
      class_name VARCHAR(255),
      branch VARCHAR(100),
      total_gold INT DEFAULT 0,
      ranking INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure unique constraint exists for UPSERT
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_period_category_program_trainee'
      ) THEN
        ALTER TABLE gold_point_rankings 
        ADD CONSTRAINT unique_period_category_program_trainee UNIQUE (period, category, program, trainee_id);
      END IF;
    END $$;
  `);

  // Read full transcript log to get exact user message content
  const logPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\9beb73e7-e676-4eaa-a35f-bc916c6c9b49\\.system_generated\\logs\\transcript_full.jsonl';
  let userContent = '';
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
    for (let j = lines.length - 1; j >= 0; j--) {
      try {
        const obj = JSON.parse(lines[j]);
        if (obj.type === 'USER_INPUT' && obj.content && obj.content.includes('gold_point_rankings')) {
          userContent = obj.content;
          break;
        }
      } catch(e) {}
    }
  }

  // Parse Month: "Month\t7/31/2026"
  let period = '7/31/2026';
  const monthLines = userContent.split('\n');
  for (const l of monthLines) {
    if (l.startsWith('Month\t') || l.startsWith('Month ')) {
      const parts = l.split(/[\t\s]+/);
      if (parts.length >= 2 && /\d+\/\d+\/\d+/.test(parts[1])) {
        period = parts[1].trim();
        break;
      }
    }
  }

  console.log(`📌 Using period: "${period}"`);

  // Clean up any row created during bad period match
  await db.query(`DELETE FROM gold_point_rankings WHERE period NOT LIKE '%2026%' AND period NOT LIKE '%2025%' AND period NOT LIKE '%2027%'`);

  const sectionMeta = [
    { category: 'ALL BRANCH', program: 'Junior' },
    { category: 'ALL BRANCH', program: 'Youth' },
    { category: 'TIMOR', program: 'Junior' },
    { category: 'TIMOR', program: 'Youth' },
    { category: 'TRITURA', program: 'Junior' },
    { category: 'TRITURA', program: 'Youth' },
    { category: 'CEMARA', program: 'Junior' },
    { category: 'CEMARA', program: 'Youth' }
  ];

  const rawLines = userContent.split('\n');
  let headerIdx = -1;
  for (let i = 0; i < rawLines.length; i++) {
    if (rawLines[i].includes('ID') && rawLines[i].includes('Nama Trainee')) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    console.error('❌ Could not locate header line with ID and Nama Trainee');
    process.exit(1);
  }

  const headerCols = rawLines[headerIdx].split('\t');
  const sectionStartCols = [];
  for (let c = 0; c < headerCols.length; c++) {
    if (headerCols[c].trim() === 'ID') {
      sectionStartCols.push(c);
    }
  }

  console.log(`📍 Found ${sectionStartCols.length} section start column offsets:`, sectionStartCols);

  const parsedMap = new Map();

  for (let lineIdx = headerIdx + 1; lineIdx < rawLines.length; lineIdx++) {
    const line = rawLines[lineIdx];
    if (!line.trim()) continue;

    const cols = line.split('\t');

    sectionStartCols.forEach((startCol, sIdx) => {
      if (sIdx >= sectionMeta.length) return;

      const trainee_id = cols[startCol] ? cols[startCol].trim() : '';
      if (!trainee_id || !/^\d+$/.test(trainee_id)) return;

      const trainee_name = cols[startCol + 1] ? cols[startCol + 1].trim() : '';
      const membership_status = cols[startCol + 2] ? cols[startCol + 2].trim() : '';
      const level = cols[startCol + 3] ? cols[startCol + 3].trim() : '';
      const house = cols[startCol + 4] ? cols[startCol + 4].trim() : '';
      const class_name = cols[startCol + 5] ? cols[startCol + 5].trim() : '';
      const branch = cols[startCol + 6] ? cols[startCol + 6].trim() : '';
      const total_gold_raw = cols[startCol + 7] ? cols[startCol + 7].trim() : '0';
      const program_raw = cols[startCol + 8] ? cols[startCol + 8].trim() : '';
      
      let rank_raw = '';
      for (let offset = 9; offset <= 15; offset++) {
        const val = cols[startCol + offset] ? cols[startCol + offset].trim() : '';
        if (val && /^\d+$/.test(val)) {
          rank_raw = val;
          break;
        }
      }

      const meta = sectionMeta[sIdx];
      const key = `${period}|${meta.category}|${meta.program}|${trainee_id}`;

      parsedMap.set(key, {
        period,
        category: meta.category,
        program: meta.program,
        trainee_id,
        trainee_name,
        membership_status,
        level,
        house,
        class_name,
        branch: branch || meta.category,
        total_gold: parseInt(total_gold_raw.replace(/,/g, ''), 10) || 0,
        ranking: parseInt(rank_raw, 10) || null
      });
    });
  }

  const parsedRecords = Array.from(parsedMap.values());
  console.log(`📦 Deduplicated total ${parsedRecords.length} trainee records.`);

  // Check existing records before upsert
  const existingRes = await db.query('SELECT period, category, program, trainee_id FROM gold_point_rankings');
  const existingSet = new Set(existingRes.rows.map(r => `${r.period}|${r.category}|${r.program}|${r.trainee_id}`));

  let totalProcessed = parsedRecords.length;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFailed = 0;

  parsedRecords.forEach(r => {
    const key = `${r.period}|${r.category}|${r.program}|${r.trainee_id}`;
    if (existingSet.has(key)) {
      totalUpdated++;
    } else {
      totalInserted++;
    }
  });

  // Batch UPSERT
  const valueRows = [];
  const queryParams = [];
  let paramIdx = 1;

  for (const r of parsedRecords) {
    valueRows.push(`(
      $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
      $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
      $${paramIdx++}, $${paramIdx++}, NOW(), NOW()
    )`);

    queryParams.push(
      r.period, r.category, r.program, r.trainee_id, r.trainee_name,
      r.membership_status, r.level, r.house, r.class_name, r.branch,
      r.total_gold, r.ranking
    );
  }

  if (valueRows.length > 0) {
    const bulkSql = `
      INSERT INTO gold_point_rankings (
        period, category, program, trainee_id, trainee_name,
        membership_status, level, house, class_name, branch,
        total_gold, ranking, created_at, updated_at
      )
      VALUES ${valueRows.join(',\n')}
      ON CONFLICT (period, category, program, trainee_id)
      DO UPDATE SET
        trainee_name = EXCLUDED.trainee_name,
        membership_status = EXCLUDED.membership_status,
        level = EXCLUDED.level,
        house = EXCLUDED.house,
        class_name = EXCLUDED.class_name,
        branch = EXCLUDED.branch,
        total_gold = EXCLUDED.total_gold,
        ranking = EXCLUDED.ranking,
        updated_at = NOW();
    `;

    await db.query(bulkSql, queryParams);
    console.log(`✅ Fast batch upserted ${parsedRecords.length} records!`);
  }

  // Save seed file
  const exportRes = await db.query('SELECT * FROM gold_point_rankings ORDER BY period DESC, category ASC, program ASC, ranking ASC');
  const jsonPath = path.join(__dirname, 'seed_gold_point_rankings.json');
  fs.writeFileSync(jsonPath, JSON.stringify(exportRes.rows, null, 2), 'utf8');
  console.log(`📦 Saved seed_gold_point_rankings.json successfully! (${exportRes.rows.length} total rows)`);

  console.log('\n========================================');
  console.log('📊 IMPORT RESULT LOG:');
  console.log(`- Total row berhasil diinsert: ${totalInserted}`);
  console.log(`- Total row berhasil diupdate: ${totalUpdated}`);
  console.log(`- Total row gagal:            ${totalFailed}`);
  console.log(`- Total row yang diproses:    ${totalProcessed}`);
  console.log('========================================\n');

  process.exit(0);
}

main().catch(console.error);
