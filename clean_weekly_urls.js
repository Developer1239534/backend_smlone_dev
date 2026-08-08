const db = require('./src/db/neonClient');

async function cleanWeeklyUrls() {
  console.log('Cleaning link_weekly URLs in database...');
  const rows = (await db.query("SELECT trainee_id, term, link_weekly FROM link_report WHERE link_weekly IS NOT NULL AND link_weekly != ''")).rows;
  
  let cleanedCount = 0;
  for (const r of rows) {
    let url = r.link_weekly;
    if (url.includes('](')) {
      url = url.split('](')[0];
    }
    if (url.startsWith('[')) {
      url = url.substring(1);
    }
    if (url.endsWith(')')) {
      url = url.slice(0, -1);
    }
    url = url.trim();

    if (url !== r.link_weekly) {
      await db.query("UPDATE link_report SET link_weekly = $1 WHERE trainee_id = $2 AND term = $3", [url, r.trainee_id, r.term]);
      cleanedCount++;
    }
  }

  console.log(`✅ Cleaned ${cleanedCount} link_weekly URLs.`);

  const sample = await db.query("SELECT trainee_id, nama, cleaned_program, cleaned_class, link_weekly FROM link_report WHERE link_weekly IS NOT NULL AND link_weekly != '' LIMIT 5");
  console.log('Sample cleaned rows:', sample.rows);
}

cleanWeeklyUrls().catch(console.error).then(() => process.exit(0));
