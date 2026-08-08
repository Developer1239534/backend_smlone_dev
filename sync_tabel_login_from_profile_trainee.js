require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🔄 Syncing all trainees from `profile_trainee` into `tabel_login_trainee`...');

    // Fetch all 628 trainees from profile_trainee
    const profileRes = await db.query('SELECT trainee_id, name FROM profile_trainee ORDER BY trainee_id ASC');
    console.log(`📌 Total trainees found in profile_trainee: ${profileRes.rows.length}`);

    let insertedCount = 0;
    const defaultPasswordHash = await bcrypt.hash('SMLDEFAULT', 6);

    // Multi-row batch insert for performance
    const chunkSize = 50;
    for (let i = 0; i < profileRes.rows.length; i += chunkSize) {
      const chunk = profileRes.rows.slice(i, i + chunkSize);
      
      const valuesSql = [];
      const queryParams = [];

      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j];
        const cleanId = String(item.trainee_id || '').trim();
        const cleanName = String(item.name || '').trim();
        const plainPw = `SML${cleanId}`;
        const pwHash = await bcrypt.hash(plainPw, 6);

        if (!cleanId) continue;

        const offset = j * 5;
        valuesSql.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, NOW(), NOW())`);
        queryParams.push(cleanId, cleanName, pwHash, plainPw, JSON.stringify({ trainee_id: cleanId, nama: cleanName, plain_password: plainPw }));
      }

      if (valuesSql.length > 0) {
        const sql = `
          INSERT INTO tabel_login_trainee (trainee_id, nama, password, plain_password, raw_data, created_at, updated_at)
          VALUES ${valuesSql.join(', ')}
          ON CONFLICT (trainee_id) DO UPDATE SET
            nama = EXCLUDED.nama,
            password = EXCLUDED.password,
            plain_password = EXCLUDED.plain_password,
            updated_at = NOW();
        `;
        await db.query(sql, queryParams);
        insertedCount += chunk.length;
      }
    }

    console.log(`✅ Successfully synced ${insertedCount} trainees into \`tabel_login_trainee\`!`);

    const countRes = await db.query('SELECT COUNT(*) FROM tabel_login_trainee');
    console.log(`📌 Current total rows in \`tabel_login_trainee\`: ${countRes.rows[0].count}`);

    const sampleRes = await db.query("SELECT trainee_id, nama, plain_password FROM tabel_login_trainee WHERE trainee_id IN ('980', '70100104', '1121')");
    console.log('\n🔍 Sample login accounts:', sampleRes.rows);

  } catch (err) {
    console.error('Error syncing tabel_login_trainee:', err);
  }
  process.exit(0);
})();
