const db = require('../src/db/neonClient');

async function main() {
  console.log('🔄 Matching & Syncing report_trainee with login_portal_fix Trainee IDs and Names...');

  // Helper retry
  async function queryWithRetry(sql, params, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await db.query(sql, params);
      } catch (err) {
        console.warn(`[Attempt ${attempt}/${retries}] Query failed: ${err.message}. Retrying in 2s...`);
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  // 1. Ensure id column is VARCHAR(50) and name column exists
  await queryWithRetry(`
    ALTER TABLE report_trainee ALTER COLUMN id TYPE VARCHAR(50) USING id::text;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS name TEXT;
  `);

  // 2. Perform instant set-based UPDATE from login_portal_fix
  console.log('Updating report_trainee.name from login_portal_fix...');
  const updateRes = await queryWithRetry(`
    UPDATE report_trainee r
    SET name = l.name, updated_at = NOW()
    FROM login_portal_fix l
    WHERE LOWER(r.id::text) = LOWER(l.id::text) OR LOWER(r.trainee_id::text) = LOWER(l.id::text);
  `);
  console.log(`✅ Updated ${updateRes.rowCount} rows in report_trainee with matching names from login_portal_fix!`);

  // 3. Insert any missing trainees from login_portal_fix into report_trainee
  console.log('Inserting any missing trainees from login_portal_fix into report_trainee...');
  const insertRes = await queryWithRetry(`
    INSERT INTO report_trainee (id, trainee_id, name, report_title, link_yt)
    SELECT l.id::text, l.id::text, l.name, '▶️ Progress Video', ''
    FROM login_portal_fix l
    LEFT JOIN report_trainee r ON LOWER(l.id::text) = LOWER(r.id::text) OR LOWER(l.id::text) = LOWER(r.trainee_id::text)
    WHERE r.id IS NULL
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `);
  console.log(`✅ Inserted/Ensured ${insertRes.rowCount} missing trainees into report_trainee!`);

  const countRes = await queryWithRetry('SELECT COUNT(*) FROM report_trainee');
  console.log(`🎉 Total report_trainee rows: ${countRes.rows[0].count}`);

  process.exit(0);
}

main().catch(console.error);
