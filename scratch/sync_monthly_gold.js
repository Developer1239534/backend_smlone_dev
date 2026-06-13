const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db/neonClient');

// Helper to clean schedule suffixes (e.g. "Millman (Sat 1-3)" -> "Millman")
function cleanClass(className) {
  if (!className) return null;
  return className.replace(/\s*\([^)]*\)/g, '').trim() || null;
}

// Helper to sanitize database/text comparisons
function normalize(val) {
  if (val === undefined || val === null || val === '') return null;
  return String(val).trim();
}

async function syncData() {
  try {
    const filePath = path.join(__dirname, 'monthly_gold_data.txt');
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    console.log(`Parsing ${lines.length} lines from monthly_gold_data.txt...`);
    const parsedTrainees = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split('\t');
      if (cols.length < 2) continue;

      const id = normalize(cols[0]);
      if (!id || isNaN(id)) continue; // skip header or invalid rows

      parsedTrainees.push({
        id,
        trainee_name: normalize(cols[1]),
        status: normalize(cols[2]),
        level: normalize(cols[3]),
        house_sml: normalize(cols[4]),
        class: cleanClass(normalize(cols[5])),
        cabang: normalize(cols[6]),
        total_gold_periode: normalize(cols[7]),
        junior_youth: normalize(cols[8]),
        rank_id_junior: normalize(cols[9]),
        rank_id_youth: normalize(cols[10]),
        rank_id_junior_timor: normalize(cols[11]),
        rank_id_youth_timor: normalize(cols[12]),
        rank_id_junior_tritura: normalize(cols[13]),
        rank_id_youth_tritura: normalize(cols[14]),
        rank_id_junior_cemara: normalize(cols[15]),
        rank_id_youth_cemara: normalize(cols[16])
      });
    }

    console.log(`Parsed ${parsedTrainees.length} valid trainee rows.`);

    let insertCount = 0;
    let updateCount = 0;
    let unchangedCount = 0;

    for (const t of parsedTrainees) {
      // Check if trainee exists
      const checkResult = await db.query(
        'SELECT * FROM dashboard_trainne WHERE id = $1',
        [t.id]
      );

      if (checkResult.rows.length === 0) {
        // Trainee does not exist, insert them
        console.log(`[INSERT] Trainee ID ${t.id} (${t.trainee_name}) not found in DB. Inserting...`);
        
        const passwordToUse = `smlone${t.id}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordToUse, salt);

        await db.query(
          `INSERT INTO dashboard_trainne (
            id, trainee_name, status, level, house_sml, class, cabang, total_gold_periode, junior_youth,
            rank_id_junior, rank_id_youth, rank_id_junior_timor, rank_id_youth_timor,
            rank_id_junior_tritura, rank_id_youth_tritura, rank_id_junior_cemara, rank_id_youth_cemara,
            password, plain_password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [
            t.id, t.trainee_name, t.status, t.level, t.house_sml, t.class, t.cabang, t.total_gold_periode, t.junior_youth,
            t.rank_id_junior, t.rank_id_youth, t.rank_id_junior_timor, t.rank_id_youth_timor,
            t.rank_id_junior_tritura, t.rank_id_youth_tritura, t.rank_id_junior_cemara, t.rank_id_youth_cemara,
            hashedPassword, passwordToUse
          ]
        );
        insertCount++;
      } else {
        // Trainee exists, compare fields
        const dbTrainee = checkResult.rows[0];
        const fieldsToCompare = [
          'trainee_name', 'status', 'level', 'house_sml', 'class', 'cabang', 'total_gold_periode', 'junior_youth',
          'rank_id_junior', 'rank_id_youth', 'rank_id_junior_timor', 'rank_id_youth_timor',
          'rank_id_junior_tritura', 'rank_id_youth_tritura', 'rank_id_junior_cemara', 'rank_id_youth_cemara'
        ];

        const diffs = {};
        for (const field of fieldsToCompare) {
          const dbVal = normalize(dbTrainee[field]);
          const fileVal = normalize(t[field]);
          if (dbVal !== fileVal) {
            diffs[field] = { db: dbVal, file: fileVal };
          }
        }

        if (Object.keys(diffs).length > 0) {
          const diffStrings = Object.entries(diffs).map(([field, vals]) => `${field} (${vals.db} -> ${vals.file})`).join(', ');
          console.log(`[UPDATE] Trainee ID ${t.id} (${t.trainee_name}) has changes: ${diffStrings}`);

          await db.query(
            `UPDATE dashboard_trainne SET
              trainee_name = $1, status = $2, level = $3, house_sml = $4, class = $5, cabang = $6,
              total_gold_periode = $7, junior_youth = $8, rank_id_junior = $9, rank_id_youth = $10,
              rank_id_junior_timor = $11, rank_id_youth_timor = $12, rank_id_junior_tritura = $13,
              rank_id_youth_tritura = $14, rank_id_junior_cemara = $15, rank_id_youth_cemara = $16
             WHERE id = $17`,
            [
              t.trainee_name, t.status, t.level, t.house_sml, t.class, t.cabang,
              t.total_gold_periode, t.junior_youth, t.rank_id_junior, t.rank_id_youth,
              t.rank_id_junior_timor, t.rank_id_youth_timor, t.rank_id_junior_tritura,
              t.rank_id_youth_tritura, t.rank_id_junior_cemara, t.rank_id_youth_cemara,
              t.id
            ]
          );
          updateCount++;
        } else {
          unchangedCount++;
        }
      }
    }

    console.log('\n=== SYNCHRONIZATION SUMMARY ===');
    console.log(`Parsed rows: ${parsedTrainees.length}`);
    console.log(`Inserted:    ${insertCount}`);
    console.log(`Updated:     ${updateCount}`);
    console.log(`Unchanged:   ${unchangedCount}`);
    console.log('===============================');

    process.exit(0);
  } catch (error) {
    console.error('Error in syncData:', error);
    process.exit(1);
  }
}

syncData();
