require('dotenv').config();
const db = require('./src/db/neonClient');

async function truncatePortalTrainee() {
  try {
    console.log('🧹 Clearing/Truncating table portal_trainee...');
    await db.query('TRUNCATE TABLE portal_trainee CASCADE;');

    const ptCount = await db.query('SELECT COUNT(*) FROM portal_trainee;');
    console.log(`✅ Table portal_trainee data cleared successfully! Current row count: ${ptCount.rows[0].count}`);
  } catch (error) {
    console.error('❌ Failed to truncate portal_trainee:', error.message);
  } finally {
    process.exit(0);
  }
}

truncatePortalTrainee();
