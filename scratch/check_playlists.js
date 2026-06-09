const db = require('../src/db/neonClient');

async function checkPlaylists() {
  try {
    const res48 = await db.query('SELECT progress_video, plain_password FROM dashboard_trainne WHERE id = $1', ['48']);
    console.log('Student 48:', res48.rows[0]);

    const res274 = await db.query('SELECT progress_video, plain_password FROM dashboard_trainne WHERE id = $1', ['274']);
    console.log('Student 274:', res274.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkPlaylists();
