const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query('SELECT trainee_id, periode, url FROM real_stage WHERE url IS NOT NULL');
    console.log(`Analyzing ${res.rows.length} URLs...`);

    const anomalies = [];
    for (const row of res.rows) {
      const url = row.url;
      // Extract Google Drive ID
      // Format: https://drive.google.com/file/d/ID/view... or similar
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) {
        anomalies.push({ trainee_id: row.trainee_id, periode: row.periode, url, reason: 'Does not match Drive file URL format' });
        continue;
      }

      const id = match[1];
      if (id.length < 33 || id.length > 44) {
        anomalies.push({ trainee_id: row.trainee_id, periode: row.periode, url, id, length: id.length, reason: 'ID length is unusual' });
      }
    }

    if (anomalies.length > 0) {
      console.log('Found anomalous URLs:', anomalies);
    } else {
      console.log('All Google Drive URL ID lengths look standard (between 33 and 44 characters).');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
