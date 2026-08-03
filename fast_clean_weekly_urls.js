const db = require('./src/db/neonClient');

async function fastCleanWeeklyUrls() {
  console.log('Running bulk SQL cleanup on link_weekly...');
  
  // 1. Remove markdown split ](http...
  await db.query(`
    UPDATE link_report 
    SET link_weekly = split_part(link_weekly, '](', 1)
    WHERE link_weekly LIKE '%](%';
  `);

  // 2. Trim leading [
  await db.query(`
    UPDATE link_report 
    SET link_weekly = ltrim(link_weekly, '[')
    WHERE link_weekly LIKE '[%';
  `);

  // 3. Trim trailing )
  await db.query(`
    UPDATE link_report 
    SET link_weekly = rtrim(link_weekly, ')')
    WHERE link_weekly LIKE '%)';
  `);

  console.log('✅ Bulk SQL cleanup completed!');

  const sample = await db.query(`
    SELECT trainee_id, nama, cleaned_program, cleaned_class, link_weekly 
    FROM link_report 
    WHERE link_weekly IS NOT NULL AND link_weekly != '' 
    LIMIT 5;
  `);

  console.log('Sample cleaned rows:', sample.rows);
}

fastCleanWeeklyUrls().catch(console.error).then(() => process.exit(0));
