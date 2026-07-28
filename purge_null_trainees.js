const db = require('./src/db/neonClient');

async function purgeNullTrainees() {
  console.log('🔄 Purging rows with NULL, empty, or placeholder names from portal_trainee...');

  const deleteRes = await db.query(`
    DELETE FROM portal_trainee 
    WHERE name IS NULL 
       OR TRIM(name) = '' 
       OR LOWER(TRIM(name)) = 'trainee' 
       OR LOWER(TRIM(name)) = 'youth'
       OR LOWER(TRIM(name)) = 'junior';
  `);

  console.log(`✅ Successfully deleted ${deleteRes.rowCount} invalid/empty trainee rows from portal_trainee.`);

  const remainingRes = await db.query('SELECT COUNT(*) FROM portal_trainee');
  console.log(`Remaining valid trainees with real names in portal_trainee: ${remainingRes.rows[0].count}`);
  process.exit(0);
}

purgeNullTrainees().catch(err => {
  console.error('Error purging null trainees:', err);
  process.exit(1);
});
