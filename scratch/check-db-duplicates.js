const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    console.log('🔍 Checking database for any uncombined duplicate dates in gp_tahunan...');
    
    const res = await pool.query(`
      SELECT trainee_id, date, COUNT(*) as count, SUM(total_gold) as total_gold_sum
      FROM gp_tahunan
      GROUP BY trainee_id, date
      HAVING COUNT(*) > 1
    `);

    console.log(`Found ${res.rows.length} duplicate group(s) in database.`);
    
    if (res.rows.length > 0) {
      console.log('Duplicate entries found! Detail:', res.rows);
      
      // Let's merge them!
      console.log('🔄 Merging duplicates...');
      for (const row of res.rows) {
        // Delete all rows for this trainee and date
        await pool.query(
          'DELETE FROM gp_tahunan WHERE trainee_id = $1 AND date = $2',
          [row.trainee_id, row.date]
        );
        // Insert a single row with the sum
        await pool.query(
          'INSERT INTO gp_tahunan (trainee_id, date, total_gold) VALUES ($1, $2, $3)',
          [row.trainee_id, row.date, row.total_gold_sum]
        );
      }
      console.log('✅ Duplicates successfully merged and combined!');
    } else {
      console.log('✅ Everything is perfectly clean! No duplicate dates found in gp_tahunan.');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
