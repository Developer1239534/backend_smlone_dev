const db = require('../src/db/neonClient');

async function main() {
  try {
    // 1. Select the records for "Oct - Dec 2026" to display them before deletion
    const selectRes = await db.query(`
      SELECT qr.*, t.trainee_name 
      FROM quarterly_report qr
      JOIN dashboard_trainne t ON qr.trainee_id = t.id
      WHERE qr.periode = 'Oct - Dec 2026'
    `);
    
    console.log('Found records to delete:');
    console.log(JSON.stringify(selectRes.rows, null, 2));

    if (selectRes.rows.length === 0) {
      console.log('No records found for period "Oct - Dec 2026".');
      process.exit(0);
    }

    // 2. Delete the records
    const deleteRes = await db.query(`
      DELETE FROM quarterly_report 
      WHERE periode = 'Oct - Dec 2026'
    `);

    console.log(`Successfully deleted ${deleteRes.rowCount} record(s) from quarterly_report.`);
    process.exit(0);
  } catch (err) {
    console.error('Error executing delete operation:', err);
    process.exit(1);
  }
}

main();
