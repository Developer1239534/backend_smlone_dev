const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

(async () => {
  if (!connectionString) {
    console.error('DATABASE_URL is not set!');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Neon database. Truncating dashboard_cemara table...');
    
    const res = await client.query('TRUNCATE TABLE dashboard_cemara RESTART IDENTITY;');
    console.log('Success: All rows deleted and ID counter reset.');
  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    await client.end();
  }
})();
