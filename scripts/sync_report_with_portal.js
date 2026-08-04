const db = require('../src/db/neonClient');

async function main() {
  console.log('🔄 Checking and matching report_trainee ID and Name with login_portal_fix...');

  // 1. Ensure report_trainee table has column name and trainee_id
  await db.query(`
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS name TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS trainee_id VARCHAR(255);
  `);

  // 2. Update name & trainee_id in report_trainee from login_portal_fix matching by ID or trainee_id
  const updateRes = await db.query(`
    UPDATE report_trainee r
    SET 
      name = l.name,
      trainee_id = l.id,
      updated_at = NOW()
    FROM login_portal_fix l
    WHERE LOWER(r.id::text) = LOWER(l.id::text) 
       OR LOWER(r.trainee_id::text) = LOWER(l.id::text)
       OR LOWER(r.name::text) = LOWER(l.name::text);
  `);

  console.log(`✅ Updated ${updateRes.rowCount} rows in report_trainee to match login_portal_fix!`);

  // 3. Insert any trainees from login_portal_fix that are not in report_trainee yet
  const insertRes = await db.query(`
    INSERT INTO report_trainee (id, trainee_id, name, created_at, updated_at)
    SELECT l.id, l.id, l.name, NOW(), NOW()
    FROM login_portal_fix l
    WHERE NOT EXISTS (
      SELECT 1 FROM report_trainee r 
      WHERE LOWER(r.id::text) = LOWER(l.id::text) 
         OR LOWER(r.trainee_id::text) = LOWER(l.id::text)
    );
  `);

  console.log(`➕ Inserted ${insertRes.rowCount} new trainees from login_portal_fix into report_trainee!`);

  // 4. Verify match status
  const matchedCount = await db.query(`
    SELECT COUNT(*) FROM report_trainee r
    JOIN login_portal_fix l ON LOWER(r.trainee_id::text) = LOWER(l.id::text) AND r.name = l.name
  `);
  console.log(`📊 Matched report_trainee rows count: ${matchedCount.rows[0].count}`);

  const totalReport = await db.query(`SELECT COUNT(*) FROM report_trainee`);
  console.log(`📊 Total report_trainee rows: ${totalReport.rows[0].count}`);

  process.exit(0);
}

main().catch(console.error);
