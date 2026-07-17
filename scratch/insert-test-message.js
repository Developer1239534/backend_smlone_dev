const { Client } = require('ssh2');
const fs = require('fs');

const script = `
const { Pool } = require('pg');
require('dotenv').config({ path: '/var/www/backend-smlone/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("INSERT INTO chat_messages (trainee_id, sender_type, message) VALUES ('600', 'TRAINEE', 'Halo min, ini pesan test!') RETURNING *").then(res => {
  console.log('Inserted message:', res.rows[0]);
  pool.end();
}).catch(err => {
  console.error('Error inserting:', err);
  pool.end();
});
`;

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`node -e "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('OUTPUT:\n' + out);
      conn.end();
    });
  });
}).connect({
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'SmlOneDev2026'
});
