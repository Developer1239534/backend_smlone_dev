const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    // Find the primary key constraint name
    const pkQuery = await pool.query(`
      SELECT tco.constraint_name
      FROM information_schema.table_constraints tco 
      WHERE tco.constraint_type = 'PRIMARY KEY' 
        AND tco.table_name = 'gp_month'
    `);
    
    if (pkQuery.rowCount > 0) {
      const constraintName = pkQuery.rows[0].constraint_name;
      console.log('Dropping constraint:', constraintName);
      await pool.query(`ALTER TABLE gp_month DROP CONSTRAINT ${constraintName}`);
    }

    // Add id serial primary key
    console.log('Adding id column as SERIAL PRIMARY KEY...');
    await pool.query('ALTER TABLE gp_month ADD COLUMN id SERIAL PRIMARY KEY');
    console.log('Successfully added id column!');

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
