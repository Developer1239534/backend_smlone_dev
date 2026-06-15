const db = require('../src/db/neonClient');

async function main() {
  try {
    await db.query('UPDATE dashboard_trainne SET tanggal_lahir = $1 WHERE id = $2', ['3/26/2014', '966']);
    console.log('✅ Updated Lady Valery Sinambela (ID 966) birthdate successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating birthdate:', err);
    process.exit(1);
  }
}

main();
