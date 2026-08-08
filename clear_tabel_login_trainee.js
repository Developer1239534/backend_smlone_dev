require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🧹 Clearing all rows from `tabel_login_trainee`...');
    await db.query('TRUNCATE TABLE tabel_login_trainee RESTART IDENTITY CASCADE');
    console.log('✅ `tabel_login_trainee` contents successfully emptied!');

    const res = await db.query('SELECT COUNT(*) FROM tabel_login_trainee');
    console.log(`📌 Current total rows in \`tabel_login_trainee\`: ${res.rows[0].count}`);

  } catch (err) {
    console.error('Error clearing tabel_login_trainee:', err);
  }
  process.exit(0);
})();
