const db = require('./src/db/neonClient');

async function dropTable() {
  try {
    await db.query('DROP TABLE IF EXISTS level_3_students_feedback;');
    console.log('Successfully dropped table level_3_students_feedback');
  } catch (error) {
    console.error('Error dropping table:', error);
  } finally {
    process.exit(0);
  }
}

dropTable();
