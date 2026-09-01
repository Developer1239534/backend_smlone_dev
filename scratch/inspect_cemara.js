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
    
    // Check if table dashboard_cemara exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dashboard_cemara'
      );
    `);
    
    console.log('Table dashboard_cemara exists:', checkTable.rows[0].exists);

    if (checkTable.rows[0].exists) {
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'dashboard_cemara'
        ORDER BY ordinal_position;
      `);
      console.log('Columns:');
      console.table(columns.rows);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
})();
