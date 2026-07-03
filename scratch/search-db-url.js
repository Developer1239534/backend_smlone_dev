const db = require('../src/db/neonClient');

async function searchDB() {
  try {
    // Search in real_stage
    const res1 = await db.query("SELECT * FROM real_stage WHERE url LIKE '%STIgf%'");
    console.log('real_stage matches:', res1.rows);

    // Search in dashboard_trainne
    const res2 = await db.query(`
      SELECT id, trainee_name, weekly_report, progres_video, profile_picture 
      FROM dashboard_trainne 
      WHERE weekly_report LIKE '%STIgf%' 
         OR progres_video LIKE '%STIgf%'
         OR profile_picture LIKE '%STIgf%'
    `);
    console.log('dashboard_trainne matches:', res2.rows);

    // Search in other tables if they have url column
    const tables = ['quarterly_report', 'myby_coin_shop', 'rewards_shop'];
    for (const table of tables) {
      try {
        const res = await db.query(`SELECT * FROM ${table} WHERE url LIKE '%STIgf%'`);
        console.log(`${table} matches:`, res.rows);
      } catch (e) {
        // Table might not have url column, try checking columns
        try {
          const res = await db.query(`
            SELECT * FROM ${table} 
            WHERE EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = '${table}' AND column_name = 'link'
            ) AND link LIKE '%STIgf%'
          `);
          console.log(`${table} (link) matches:`, res.rows);
        } catch (err) {}
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

searchDB();
