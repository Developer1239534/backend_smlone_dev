const { pool } = require('./src/db/neonClient');

async function checkIDMatch() {
  try {
    const resReal = await pool.query(`SELECT DISTINCT TRIM("ID Trainee") as id, TRIM("Nama Trainee") as name FROM real_stage WHERE "ID Trainee" IS NOT NULL AND "ID Trainee" != ''`);
    const realIDs = new Set(resReal.rows.map(r => r.id));
    console.log(`Total unique Trainee IDs in real_stage: ${realIDs.size}`);

    const resProfile = await pool.query(`SELECT DISTINCT TRIM("ID") as id FROM profile_trainee WHERE "ID" IS NOT NULL AND "ID" != ''`);
    const profileIDs = new Set(resProfile.rows.map(r => r.id));
    console.log(`Total unique IDs in profile_trainee: ${profileIDs.size}`);

    let matchedWithProfile = 0;
    for (const id of realIDs) {
      if (profileIDs.has(id)) matchedWithProfile++;
    }
    console.log(`Matched between real_stage and profile_trainee: ${matchedWithProfile} / ${realIDs.size}`);

    const resCred = await pool.query(`SELECT DISTINCT TRIM("ID") as id FROM credential_portal WHERE "ID" IS NOT NULL AND "ID" != ''`);
    const credIDs = new Set(resCred.rows.map(r => r.id));
    let matchedWithCred = 0;
    for (const id of realIDs) {
      if (credIDs.has(id)) matchedWithCred++;
    }
    console.log(`Matched between real_stage and credential_portal: ${matchedWithCred} / ${realIDs.size}`);

    // Check if there are any whitespace issues
    const uncleaned = await pool.query(`SELECT COUNT(*) FROM real_stage WHERE "ID Trainee" != TRIM("ID Trainee")`);
    console.log(`Uncleaned / untrimmed IDs in real_stage: ${uncleaned.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkIDMatch();
