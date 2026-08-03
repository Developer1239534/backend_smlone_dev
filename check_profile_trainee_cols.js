require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    const r = await db.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='profile_trainee' ORDER BY ordinal_position"
    );
    console.log('Current profile_trainee columns:');
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
