const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('BEGIN');

    console.log('1. Deleting the 4 houses...');
    await pool.query('DELETE FROM houses');

    console.log('2. Inserting the ORIGINAL 5 houses (T-H-R-Q-C)...');
    const insertHousesQuery = `
      INSERT INTO houses (id, name, description, core_value) VALUES
      ('Thenova', 'Thenova', 'The Seekers. Curiosity is the engine of all progress.', 'Curiosity'),
      ('Havaria', 'Havaria', 'The Caretakers. Caring is the foundation of human connection.', 'Empathy'),
      ('Reverion', 'Reverion', 'The Guardians. Trustworthiness is priceless.', 'Integrity'),
      ('Quorion', 'Quorion', 'The Masters. Strive for excellence in every action.', 'Precision'),
      ('Creanova', 'Creanova', 'The Visionaries. Bravery to create boldly.', 'Originality')
    `;
    await pool.query(insertHousesQuery);

    console.log('3. Re-adding option_e column to questions...');
    try {
      await pool.query('ALTER TABLE questions ADD COLUMN option_e TEXT');
    } catch (e) {
      console.log('Column option_e might already exist, continuing...');
    }

    await pool.query('COMMIT');
    console.log('Rollback completed successfully!');

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Rollback failed:', err);
  } finally {
    await pool.end();
  }
}
main();
