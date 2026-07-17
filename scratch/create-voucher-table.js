const { Pool } = require('pg');
require('dotenv').config(); // Load from root
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('CREATE TABLE IF NOT EXISTS voucher_realstage (id SERIAL PRIMARY KEY, issue_date VARCHAR(255), no_voucher VARCHAR(255), nama_trainee VARCHAR(255), doc_url TEXT);')
  .then(() => { console.log('Success'); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
