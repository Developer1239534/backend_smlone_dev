const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const keys = await pool.query(`
      SELECT kcu.column_name 
      FROM information_schema.table_constraints tco 
      JOIN information_schema.key_column_usage kcu 
        ON kcu.constraint_name = tco.constraint_name 
      WHERE tco.constraint_type = 'PRIMARY KEY' 
        AND tco.table_name = 'gp_month'
    `);
    console.log('PK Columns:', keys.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
