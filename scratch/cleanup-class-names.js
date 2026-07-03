const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    console.log('🔄 Fetching all trainees to clean class names...');
    const res = await pool.query('SELECT id, class FROM dashboard_trainne WHERE class LIKE \'%(%\'');
    console.log(`Found ${res.rows.length} trainees with parentheses in class names.`);

    let updatedCount = 0;
    for (const row of res.rows) {
      const cleanClass = row.class.replace(/\s*\([^)]*\)/g, '').trim();
      await pool.query(
        'UPDATE dashboard_trainne SET class = $1 WHERE id = $2',
        [cleanClass, row.id]
      );
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} trainee class names in the database!`);

    // Verify
    const check = await pool.query('SELECT DISTINCT class FROM dashboard_trainne ORDER BY class ASC');
    console.log('\nAll unique clean class names in database:');
    console.log(check.rows.map(r => r.class));

  } catch (err) {
    console.error('❌ Error cleaning class names:', err.message);
  } finally {
    await pool.end();
  }
}

main();
