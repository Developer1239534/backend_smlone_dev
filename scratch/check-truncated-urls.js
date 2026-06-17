const db = require('../src/db/neonClient');

async function run() {
  try {
    const res = await db.query(`
      SELECT trainee_id, periode, url 
      FROM quarterly_report 
      WHERE url LIKE '%/e' 
         OR url LIKE '%/ed' 
         OR url LIKE '%/edi'
         OR url NOT LIKE '%edit?usp=drivesdk' AND url NOT LIKE '%view?usp=drivesdk' AND url != ''
    `);
    
    console.log('Quarterly reports in DB with potentially incomplete or truncated URLs:');
    if (res.rows.length === 0) {
      console.log('No truncated URLs found in database!');
    } else {
      res.rows.forEach(row => {
        console.log(`- ID: ${row.trainee_id} | Periode: ${row.periode} | URL: "${row.url}"`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
