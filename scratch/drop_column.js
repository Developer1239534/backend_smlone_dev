const db = require('../src/db/neonClient');

async function dropColumn() {
  try {
    console.log('Dropping column hubungi_kami from table dashboard_trainne...');
    const result = await db.query('ALTER TABLE dashboard_trainne DROP COLUMN IF EXISTS hubungi_kami;');
    console.log('Result:', result);
    console.log('Successfully dropped column!');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping column:', error);
    process.exit(1);
  }
}

dropColumn();
