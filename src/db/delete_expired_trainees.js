const fs = require('fs');
const path = require('path');
const db = require('./neonClient');

async function main() {
  try {
    console.log('🔄 Backing up current dashboard_trainne table before deleting expired trainees...');
    const backupResult = await db.query('SELECT * FROM dashboard_trainne');
    const backupPath = path.join(__dirname, 'trainee_backup_before_delete_expired.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupResult.rows, null, 2), 'utf8');
    console.log(`✅ Backup successfully saved to: ${backupPath}`);

    console.log('🗑️ Deleting trainees whose status is not Active or Active (Grace Period)...');
    const deleteResult = await db.query(
      "DELETE FROM dashboard_trainne WHERE status NOT IN ('Active', 'Active (Grace Period)')"
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} expired trainees.`);

    const countResult = await db.query('SELECT COUNT(*) FROM dashboard_trainne');
    console.log(`📌 Final Trainee Count in DB: ${countResult.rows[0].count}`);

    // Verify status breakdown
    const breakdownResult = await db.query(
      'SELECT status, COUNT(*) FROM dashboard_trainne GROUP BY status'
    );
    console.log('📊 Current DB status breakdown:');
    breakdownResult.rows.forEach(row => {
      console.log(`   - ${row.status}: ${row.count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing deletion:', err);
    process.exit(1);
  }
}

main();
