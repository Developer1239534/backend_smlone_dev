require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🧹 Clearing values in column `house_role`...');
    
    const result = await db.query(`
      UPDATE profile_trainee 
      SET house_role = NULL;
    `);

    console.log(`✅ Successfully cleared \`house_role\` in ${result.rowCount} rows of \`profile_trainee\`!`);

    const checkRes = await db.query(`
      SELECT trainee_id, name, house_role 
      FROM profile_trainee 
      LIMIT 5
    `);
    console.log('\n🔍 Sample rows after clearing house_role:');
    console.log(JSON.stringify(checkRes.rows, null, 2));

  } catch (err) {
    console.error('Error clearing house_role:', err);
  }
  process.exit(0);
})();
