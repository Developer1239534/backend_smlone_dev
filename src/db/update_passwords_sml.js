const db = require('./neonClient');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    console.log('🔄 Fetching all trainees from the database...');
    const result = await db.query('SELECT id FROM dashboard_trainne');
    const trainees = result.rows;
    console.log(`📋 Found ${trainees.length} trainees to update.`);

    let updatedCount = 0;

    for (const trainee of trainees) {
      const id = trainee.id;
      const newPlainPassword = `SML${id}`;
      
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(newPlainPassword, salt);

      await db.query(
        'UPDATE dashboard_trainne SET password = $1, plain_password = $2 WHERE id = $3',
        [newHashedPassword, newPlainPassword, id]
      );
      
      updatedCount++;
      if (updatedCount % 50 === 0 || updatedCount === trainees.length) {
        console.log(`   - Updated ${updatedCount}/${trainees.length} trainees.`);
      }
    }

    console.log(`✅ Successfully updated passwords for all ${updatedCount} trainees.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating passwords:', err);
    process.exit(1);
  }
}

main();
