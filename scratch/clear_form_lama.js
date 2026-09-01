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
    console.log('Connected to Neon database. Truncating data_form_lama table...');
    
    const res = await client.query('TRUNCATE TABLE data_form_lama RESTART IDENTITY;');
    console.log('Success: All rows in data_form_lama deleted and ID counter reset.');
  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    await client.end();
  }
})();
