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
    
    // Total count
    const totalRes = await client.query('SELECT COUNT(*) FROM data_form_lama;');
    const total = totalRes.rows[0].count;
    
    // Unique count based on full_name, email_address, and timestamp
    const uniqueRes = await client.query(`
      SELECT COUNT(DISTINCT (timestamp, email_address, full_name)) 
      FROM data_form_lama;
    `);
    const unique = uniqueRes.rows[0].count;

    // Show some samples of duplicates
    const dupRes = await client.query(`
      SELECT timestamp, email_address, full_name, COUNT(*) 
      FROM data_form_lama 
      GROUP BY timestamp, email_address, full_name 
      HAVING COUNT(*) > 1 
      LIMIT 10;
    `);
    
    console.log(`Total rows in database: ${total}`);
    console.log(`Unique rows in database: ${unique}`);
    console.log('Duplicates Sample:');
    console.table(dupRes.rows);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
})();
