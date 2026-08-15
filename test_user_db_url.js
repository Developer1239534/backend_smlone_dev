const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_pxzDdoQif5M1@ep-damp-hat-axnby8iy-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('✅ Connected successfully to Neon DB!');

    const res = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';');
    console.log('📋 Public Tables:', res.rows.map(r => r.table_name));

    const houseRankCols = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'house_rank\';');
    console.log('📋 house_rank columns:', houseRankCols.rows);

    const dataCount = await client.query('SELECT COUNT(*) FROM house_rank;');
    console.log('📊 Current rows in house_rank:', dataCount.rows[0].count);
  } catch (err) {
    console.error('❌ Connection Error:', err);
  } finally {
    await client.end();
  }
}

testConnection();
