const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

async function setupTabelLoginTrainee() {
  console.log('🚀 Creating table `tabel_login_trainee`...');

  // Create table tabel_login_trainee
  await db.query(`
    CREATE TABLE IF NOT EXISTS tabel_login_trainee (
      id SERIAL PRIMARY KEY,
      trainee_id VARCHAR(50) UNIQUE NOT NULL,
      nama VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      plain_password VARCHAR(255) NOT NULL,
      raw_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tabel_login_trainee_trainee_id ON tabel_login_trainee(trainee_id);
  `);
  console.log('✅ Table `tabel_login_trainee` ready.');

  // Collect unique trainee_ids and names from link_report, report_activity, portal_admin, and portal_trainee
  console.log('🔄 Fetching unique trainees from link_report, report_activity, portal_admin, and portal_trainee...');

  const uniqueTraineesQuery = `
    WITH combined AS (
      SELECT TRIM(trainee_id) as trainee_id, TRIM(nama) as nama FROM link_report WHERE trainee_id IS NOT NULL AND TRIM(trainee_id) != ''
      UNION ALL
      SELECT TRIM(trainee_id) as trainee_id, TRIM(name) as nama FROM report_activity WHERE trainee_id IS NOT NULL AND TRIM(trainee_id) != ''
      UNION ALL
      SELECT TRIM(trainee_id) as trainee_id, TRIM(name) as nama FROM portal_admin WHERE trainee_id IS NOT NULL AND TRIM(trainee_id) != ''
      UNION ALL
      SELECT TRIM(trainee_id) as trainee_id, TRIM(name) as nama FROM portal_trainee WHERE trainee_id IS NOT NULL AND TRIM(trainee_id) != ''
    )
    SELECT trainee_id, MAX(nama) as nama
    FROM combined
    GROUP BY trainee_id
    ORDER BY trainee_id ASC;
  `;

  const result = await db.query(uniqueTraineesQuery);
  const trainees = result.rows;
  console.log(`📊 Found ${trainees.length} unique trainees across all tables.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const trainee of trainees) {
    const traineeId = trainee.trainee_id;
    const nama = trainee.nama || `Trainee ${traineeId}`;
    const plainPassword = `SML${traineeId}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const upsertQuery = `
      INSERT INTO tabel_login_trainee (trainee_id, nama, password, plain_password, raw_data, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (trainee_id)
      DO UPDATE SET
        nama = COALESCE(EXCLUDED.nama, tabel_login_trainee.nama),
        password = EXCLUDED.password,
        plain_password = EXCLUDED.plain_password,
        updated_at = NOW()
      RETURNING xmax;
    `;

    const res = await db.query(upsertQuery, [
      traineeId,
      nama,
      hashedPassword,
      plainPassword,
      JSON.stringify({ trainee_id: traineeId, nama, plain_password: plainPassword })
    ]);

    if (res.rows[0].xmax === '0') {
      insertedCount++;
    } else {
      updatedCount++;
    }
  }

  console.log(`✅ Populate completed: ${insertedCount} inserted, ${updatedCount} updated.`);

  // Verification count
  const countRes = await db.query(`SELECT COUNT(*) FROM tabel_login_trainee`);
  console.log(`📌 Total records in tabel_login_trainee: ${countRes.rows[0].count}`);

  // Sample check
  const sampleRes = await db.query(`SELECT trainee_id, nama, plain_password FROM tabel_login_trainee LIMIT 5`);
  console.log('🔍 Sample login records:', sampleRes.rows);
}

setupTabelLoginTrainee().catch(console.error).then(() => process.exit(0));
