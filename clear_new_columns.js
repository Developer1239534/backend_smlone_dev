require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🧹 Clearing values in columns: school, personal_email, birthday, trainee_wa_number, parent_wa_number...');
    
    const result = await db.query(`
      UPDATE profile_trainee 
      SET 
        school = NULL,
        personal_email = NULL,
        birthday = NULL,
        trainee_wa_number = NULL,
        parent_wa_number = NULL;
    `);

    console.log(`✅ Successfully cleared ${result.rowCount} rows in \`profile_trainee\`!`);

    const checkRes = await db.query(`
      SELECT trainee_id, name, school, personal_email, birthday, trainee_wa_number, parent_wa_number 
      FROM profile_trainee 
      LIMIT 5
    `);
    console.log('\n🔍 Sample rows after clearing:');
    console.log(JSON.stringify(checkRes.rows, null, 2));

  } catch (err) {
    console.error('Error clearing columns:', err);
  }
  process.exit(0);
})();
