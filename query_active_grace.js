const db = require('./src/db/neonClient');

async function queryStats() {
  try {
    // 1. Total Active & Grace Period with BOTH links
    const totalBoth = await db.query(`
      SELECT COUNT(*) 
      FROM link_report 
      WHERE (status ILIKE '%active%' OR status ILIKE '%grace%')
        AND link_term IS NOT NULL AND link_term != ''
        AND link_youtube IS NOT NULL AND link_youtube != '';
    `);

    // 2. Breakdown Active only
    const activeBoth = await db.query(`
      SELECT COUNT(*) 
      FROM link_report 
      WHERE status = 'Active'
        AND link_term IS NOT NULL AND link_term != ''
        AND link_youtube IS NOT NULL AND link_youtube != '';
    `);

    // 3. Breakdown Grace Period only
    const graceBoth = await db.query(`
      SELECT COUNT(*) 
      FROM link_report 
      WHERE status ILIKE '%grace%'
        AND link_term IS NOT NULL AND link_term != ''
        AND link_youtube IS NOT NULL AND link_youtube != '';
    `);

    // 4. Fetch list of these trainees
    const listTrainees = await db.query(`
      SELECT trainee_id, nama, status, link_term, link_youtube 
      FROM link_report 
      WHERE (status ILIKE '%active%' OR status ILIKE '%grace%')
        AND link_term IS NOT NULL AND link_term != ''
        AND link_youtube IS NOT NULL AND link_youtube != ''
      ORDER BY nama ASC;
    `);

    console.log('=========================================');
    console.log(`📊 Active + Grace Period with BOTH links: ${totalBoth.rows[0].count}`);
    console.log(`✅ Status 'Active' with BOTH links: ${activeBoth.rows[0].count}`);
    console.log(`⏳ Status 'Active (Grace Period)' with BOTH links: ${graceBoth.rows[0].count}`);
    console.log('=========================================\n');
    console.log('List of Trainees:');
    console.log(listTrainees.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

queryStats();
