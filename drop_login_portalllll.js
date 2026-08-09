const db = require('./src/db/neonClient');

async function dropTable() {
  try {
    console.log('🔥 Dropping table "login_portalllll" from database...');
    await db.query('DROP TABLE IF EXISTS login_portalllll CASCADE;');
    console.log('✅ Table "login_portalllll" dropped successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error dropping table:', err);
    process.exit(1);
  }
}

dropTable();
