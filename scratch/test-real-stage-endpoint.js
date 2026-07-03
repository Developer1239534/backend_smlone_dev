const http = require('http');
const db = require('../src/db/neonClient');

async function main() {
  // Let's first verify what the DB contains for 863
  const dbRes = await db.query('SELECT * FROM real_stage WHERE trainee_id = $1 ORDER BY periode DESC', ['863']);
  console.log('Database rows for 863:', dbRes.rows);

  // Start the server on a random port (e.g. 4005) to test
  const app = require('../src/server'); // Wait! src/server.js listens on PORT from env
}

main().catch(console.error);
