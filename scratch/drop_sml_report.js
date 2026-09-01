const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Neon database. Dropping sml_report table...');
    await client.query('DROP TABLE IF EXISTS sml_report;');
    console.log('Success: Table sml_report dropped.');
  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    await client.end();
  }
})();
