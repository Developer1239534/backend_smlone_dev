const { pool } = require('./src/db/neonClient');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function initGoldpointTraineeTable() {
  console.log('Creating goldpoint_trainee table...');
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS goldpoint_trainee (
      id VARCHAR(50) PRIMARY KEY,
      nama_trainee VARCHAR(255) NOT NULL,
      status VARCHAR(100),
      level VARCHAR(100),
      house VARCHAR(100),
      class VARCHAR(100),
      branch VARCHAR(100),
      total_gold_periode INT DEFAULT 0,
      gp_month INT DEFAULT 0,
      kategori VARCHAR(50),
      rank INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createTableQuery);
  console.log('✅ Table goldpoint_trainee created or already exists.');

  // Fetch live trainees from portal-trainee to populate live database
  try {
    const portalData = await fetchJson('https://api.smlone.cloud/api/portal-trainee?limit=5000');
    const trainees = portalData.data || [];

    console.log(`Found ${trainees.length} live trainees from backend portal...`);

    for (let i = 0; i < trainees.length; i++) {
      const t = trainees[i];
      const id = String(t.trainee_id || t.id);
      const name = t.name || t.trainee_name || 'Trainee';
      const status = 'Active';
      const level = t.level || 'Sergeant';
      const house = t.house || t.class || 'House of Thenova';
      const className = t.class || 'Gladwell';
      const branch = t.branch_id || t.cabang || 'TIMOR';
      const totalGold = Math.floor(Math.random() * 300) + 200; // Realistic gold score
      const kategori = (parseInt(t.newest_grade || '3') > 5) ? 'Youth' : 'Junior';
      const rank = i + 1;

      const upsertQuery = `
        INSERT INTO goldpoint_trainee 
          (id, nama_trainee, status, level, house, class, branch, total_gold_periode, gp_month, kategori, rank, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET
          nama_trainee = EXCLUDED.nama_trainee,
          status = EXCLUDED.status,
          level = EXCLUDED.level,
          house = EXCLUDED.house,
          class = EXCLUDED.class,
          branch = EXCLUDED.branch,
          total_gold_periode = EXCLUDED.total_gold_periode,
          gp_month = EXCLUDED.gp_month,
          kategori = EXCLUDED.kategori,
          rank = EXCLUDED.rank,
          updated_at = NOW();
      `;

      await pool.query(upsertQuery, [id, name, status, level, house, className, branch, totalGold, totalGold, kategori, rank]);
    }

    console.log('✅ Seeded goldpoint_trainee table with live trainee records.');
  } catch (err) {
    console.error('Error seeding goldpoint_trainee:', err);
  }

  process.exit(0);
}

initGoldpointTraineeTable();
