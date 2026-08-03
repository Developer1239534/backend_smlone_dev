require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🛠️ Updating `profile_trainee` table schema...');

    await db.query(`
      ALTER TABLE profile_trainee 
      ADD COLUMN IF NOT EXISTS school VARCHAR(255),
      ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS birthday VARCHAR(100),
      ADD COLUMN IF NOT EXISTS trainee_wa_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS parent_wa_number VARCHAR(100);
    `);

    console.log('✅ Columns added successfully to `profile_trainee`!');

    const r = await db.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='profile_trainee' ORDER BY ordinal_position"
    );
    console.log('\n📋 Updated profile_trainee columns:');
    console.log(r.rows.map(col => col.column_name));

  } catch (err) {
    console.error('Migration error:', err);
  }
  process.exit(0);
})();
