const db = require('../src/db/neonClient');

async function main() {
  try {
    const traineeId = '274';
    const period = 'Jan-Apr 2026';
    const correctUrl = 'https://docs.google.com/document/d/1jAXXLkm3uphIKAEQTqkGxUb--vOsHfCs3yeA63YQ574/edit?usp=drivesdk';

    console.log(`Updating ID ${traineeId} for period "${period}"...`);

    const res = await db.query(`
      UPDATE quarterly_report 
      SET url = $1 
      WHERE trainee_id = $2 AND periode = $3
      RETURNING *
    `, [correctUrl, traineeId, period]);

    if (res.rows.length > 0) {
      console.log('✅ Update successful! Updated record:');
      console.log(res.rows[0]);
    } else {
      console.log('❌ Record not found in DB to update.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating record:', err);
    process.exit(1);
  }
}

main();
