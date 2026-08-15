const { Client } = require('pg');

const urls = [
  { name: 'DB 1 (ep-damp-hat-axnby8iy)', url: 'postgresql://neondb_owner:npg_pxzDdoQif5M1@ep-damp-hat-axnby8iy-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' },
  { name: 'DB 2 (ep-muddy-bar-aojszwfn)', url: 'postgresql://neondb_owner:npg_bUS6uiTFBA3K@ep-muddy-bar-aojszwfn-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' },
  { name: 'DB 3 (ep-aged-lake-ax5jy3ol)', url: 'postgresql://neondb_owner:npg_Ti6wJdY8KDfc@ep-aged-lake-ax5jy3ol-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' },
  { name: 'DB 4 (ep-square-glade-a151mifb)', url: 'postgresql://neondb_owner:n89DMyYhUagV@ep-square-glade-a151mifb.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' }
];

async function checkAllDbs() {
  for (const dbInfo of urls) {
    const client = new Client({ connectionString: dbInfo.url });
    try {
      await client.connect();
      const res = await client.query('SELECT COUNT(*) FROM house_rank;');
      console.log(`✅ ${dbInfo.name} -> house_rank count: ${res.rows[0].count}`);
    } catch (err) {
      console.log(`❌ ${dbInfo.name} -> Error: ${err.message}`);
    } finally {
      await client.end().catch(() => {});
    }
  }
}

checkAllDbs();
