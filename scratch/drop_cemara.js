const db = require('../src/db/neonClient');

async function dropCemara() {
  try {
    console.log('Dropping table cemara_registrations...');
    await db.query('DROP TABLE IF EXISTS "cemara_registrations" CASCADE;');
    console.log('Successfully dropped cemara_registrations table.');
    process.exit(0);
  } catch (err) {
    console.error('Error dropping table:', err);
    process.exit(1);
  }
}

dropCemara();
