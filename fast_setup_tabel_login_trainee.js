const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

async function fastSetupTabelLoginTrainee() {
  console.log('🚀 Fast setting up `tabel_login_trainee`...');

  // Ensure table exists
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
  console.log(`📊 Processing ${trainees.length} unique trainees...`);

  // Prepare batch parameters
  const batchSize = 200;
  for (let i = 0; i < trainees.length; i += batchSize) {
    const chunk = trainees.slice(i, i + batchSize);
    
    // Hash passwords concurrently with salt round 6 for super fast initialization
    const hashedChunk = await Promise.all(chunk.map(async t => {
      const traineeId = t.trainee_id;
      const nama = t.nama || `Trainee ${traineeId}`;
      const plainPassword = `SML${traineeId}`;
      const hashedPassword = await bcrypt.hash(plainPassword, 6);
      return { traineeId, nama, plainPassword, hashedPassword };
    }));

    // Build multi-row INSERT query
    const values = [];
    const placeholders = [];

    hashedChunk.forEach((item, index) => {
      const offset = index * 5;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, NOW())`);
      values.push(
        item.traineeId,
        item.nama,
        item.hashedPassword,
        item.plainPassword,
        JSON.stringify({ trainee_id: item.traineeId, nama: item.nama, plain_password: item.plainPassword })
      );
    });

    const query = `
      INSERT INTO tabel_login_trainee (trainee_id, nama, password, plain_password, raw_data, updated_at)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (trainee_id) DO UPDATE SET
        nama = COALESCE(EXCLUDED.nama, tabel_login_trainee.nama),
        password = EXCLUDED.password,
        plain_password = EXCLUDED.plain_password,
        updated_at = NOW();
    `;

    await db.query(query, values);
    console.log(`✅ Chunk ${Math.floor(i / batchSize) + 1}/${Math.ceil(trainees.length / batchSize)} processed.`);
  }

  const finalCount = await db.query(`SELECT COUNT(*) FROM tabel_login_trainee`);
  console.log(`\n🎉 SUCCESS! Total unique trainees in tabel_login_trainee: ${finalCount.rows[0].count}`);

  const sample = await db.query(`SELECT trainee_id, nama, plain_password FROM tabel_login_trainee ORDER BY id ASC LIMIT 5`);
  console.log('\n🔍 Sample login credentials:', sample.rows);
}

fastSetupTabelLoginTrainee().catch(console.error).then(() => process.exit(0));
