const db = require('../src/db/neonClient');
const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        location: res.headers.location
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function main() {
  try {
    const res = await db.query('SELECT trainee_id, periode, url FROM real_stage WHERE url IS NOT NULL LIMIT 10');
    console.log('Testing accessibility of 10 random Real Stage URLs...');
    
    for (const row of res.rows) {
      const result = await checkUrl(row.url);
      console.log(`Trainee ID: ${row.trainee_id}, Period: ${row.periode}`);
      console.log(`  URL: ${row.url}`);
      console.log(`  Status Code: ${result.statusCode}`);
      if (result.location) {
        console.log(`  Redirects to: ${result.location}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
