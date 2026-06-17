const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('Querying tautan_tambahan column...');
    
    // Count total rows where tautan_tambahan is not null and not empty
    const countRes = await db.query(`
      SELECT COUNT(*) as count 
      FROM dashboard_trainne 
      WHERE tautan_tambahan IS NOT NULL 
        AND tautan_tambahan != ''
    `);
    
    const count = parseInt(countRes.rows[0].count, 10);
    console.log(`Number of rows with non-empty tautan_tambahan: ${count}`);

    if (count > 0) {
      console.log('\nSample records with tautan_tambahan:');
      const sampleRes = await db.query(`
        SELECT id, trainee_name, tautan_tambahan 
        FROM dashboard_trainne 
        WHERE tautan_tambahan IS NOT NULL 
          AND tautan_tambahan != '' 
        LIMIT 10
      `);
      console.table(sampleRes.rows);
    } else {
      console.log('The tautan_tambahan column is completely empty/null for all trainees.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error checking database:', err);
    process.exit(1);
  }
}

main();
