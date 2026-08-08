const db = require('./src/db/neonClient');

async function truncateFeedbackTable() {
  try {
    console.log('🧹 Truncating table "feedback" in database...');
    await db.query('TRUNCATE TABLE feedback;');
    console.log('✅ Table "feedback" is now completely empty (0 rows)!');
    process.exit(0);
  } catch (err) {
    console.error('Error truncating feedback table:', err);
    process.exit(1);
  }
}

truncateFeedbackTable();
