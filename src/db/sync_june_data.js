const fs = require('fs');
const path = require('path');
const db = require('./neonClient');
const bcrypt = require('bcryptjs');

async function main() {
  const filePath = path.join(__dirname, '../../scratch/june_data.txt');
  if (!fs.existsSync(filePath)) {
    console.error('File not found at:', filePath);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  
  // Find where the headers are. It should be the line that starts with "ID"
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('ID\t') || lines[i].startsWith('ID ')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error('Could not find header line starting with ID');
    process.exit(1);
  }

  console.log(`Found header at line ${headerIndex + 1}`);

  const trainees = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = lines[i].split('\t').map(c => c.trim());
    if (cols.length < 2 || !cols[0]) continue; // Skip lines without ID or Name

    trainees.push({
      id: cols[0],
      name: cols[1],
      status: cols[2] || 'Active',
      level: cols[3] || null,
      house_sml: cols[4] || null,
      class: cols[5] || null,
      branch: cols[6] || null,
      total_gold_periode: cols[7] || null,
      junior_youth: cols[8] || null,
      rank_id_junior: cols[9] || null,
      rank_id_youth: cols[10] || null,
      rank_id_junior_timor: cols[11] || null,
      rank_id_youth_timor: cols[12] || null,
      rank_id_junior_tritura: cols[13] || null,
      rank_id_youth_tritura: cols[14] || null,
      rank_id_junior_cemara: cols[15] || null,
      rank_id_youth_cemara: cols[16] || null,
    });
  }

  console.log(`Parsed ${trainees.length} trainees from file.`);

  let updatedCount = 0;
  let insertedCount = 0;

  for (const t of trainees) {
    // Check if ID exists in database
    const check = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', [t.id]);
    
    if (check.rows.length > 0) {
      // Exist: UPDATE only specified fields without replacing password, progress_video, etc.
      // (as per instructions: "jangan mengganti, menghapus atau mengubah data yang sudah ada")
      const current = check.rows[0];

      const updateQuery = `
        UPDATE dashboard_trainne SET
          trainee_name = $1,
          status = $2,
          level = $3,
          class = $4,
          cabang = $5,
          house_sml = $6,
          total_gold_periode = $7,
          junior_youth = $8,
          rank_id_junior = $9,
          rank_id_youth = $10,
          rank_id_junior_timor = $11,
          rank_id_youth_timor = $12,
          rank_id_junior_tritura = $13,
          rank_id_youth_tritura = $14,
          rank_id_junior_cemara = $15,
          rank_id_youth_cemara = $16
        WHERE id = $17;
      `;

      const updateValues = [
        t.name || current.trainee_name,
        t.status || current.status,
        t.level || current.level,
        t.class || current.class,
        t.branch || current.cabang,
        t.house_sml || current.house_sml,
        t.total_gold_periode || current.total_gold_periode,
        t.junior_youth || current.junior_youth,
        t.rank_id_junior || current.rank_id_junior,
        t.rank_id_youth || current.rank_id_youth,
        t.rank_id_junior_timor || current.rank_id_junior_timor,
        t.rank_id_youth_timor || current.rank_id_youth_timor,
        t.rank_id_junior_tritura || current.rank_id_junior_tritura,
        t.rank_id_youth_tritura || current.rank_id_youth_tritura,
        t.rank_id_junior_cemara || current.rank_id_junior_cemara,
        t.rank_id_youth_cemara || current.rank_id_youth_cemara,
        t.id
      ];

      await db.query(updateQuery, updateValues);
      updatedCount++;
    } else {
      // Not Exist: INSERT new student
      // Generate password default format "SML[ID]"
      const plainPassword = `SML${t.id}`;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const insertQuery = `
        INSERT INTO dashboard_trainne (
          id, trainee_name, status, level, class, cabang,
          house_sml, total_gold_periode, junior_youth,
          rank_id_junior, rank_id_youth,
          rank_id_junior_timor, rank_id_youth_timor,
          rank_id_junior_tritura, rank_id_youth_tritura,
          rank_id_junior_cemara, rank_id_youth_cemara,
          password, plain_password
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        );
      `;

      const insertValues = [
        t.id, t.name, t.status, t.level, t.class, t.branch,
        t.house_sml, t.total_gold_periode, t.junior_youth,
        t.rank_id_junior, t.rank_id_youth,
        t.rank_id_junior_timor, t.rank_id_youth_timor,
        t.rank_id_junior_tritura, t.rank_id_youth_tritura,
        t.rank_id_junior_cemara, t.rank_id_youth_cemara,
        hashedPassword, plainPassword
      ];

      await db.query(insertQuery, insertValues);
      insertedCount++;
    }
  }

  console.log(`Sync complete. Updated: ${updatedCount}, Inserted: ${insertedCount}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Error running sync:', err);
  process.exit(1);
});
