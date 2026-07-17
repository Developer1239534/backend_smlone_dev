const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('BEGIN');

    console.log('1. Deleting old houses...');
    await pool.query('DELETE FROM houses');

    console.log('2. Inserting 4 new houses...');
    const insertHousesQuery = `
      INSERT INTO houses (id, name, description, core_value) VALUES
      ('Alteon', 'Alteon', 'House of Alteon (Temporary Description)', 'Placeholder Value'),
      ('Cygnus', 'Cygnus', 'House of Cygnus (Temporary Description)', 'Placeholder Value'),
      ('Eldoria', 'Eldoria', 'House of Eldoria (Temporary Description)', 'Placeholder Value'),
      ('Thenova', 'Thenova', 'The Seekers. Curiosity is the engine of all progress.', 'Curiosity')
    `;
    await pool.query(insertHousesQuery);

    console.log('3. Dropping option_e column from questions...');
    try {
      await pool.query('ALTER TABLE questions DROP COLUMN option_e');
    } catch (e) {
      console.log('Column option_e might already be dropped or does not exist, continuing...');
    }

    await pool.query('COMMIT');
    console.log('Migration completed successfully!');

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}
main();
