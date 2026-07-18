const { Client } = require('ssh2');
const conn = new Client();
const config = {
  host: '187.127.206.193',
  port: 22,
  username: 'root',
  password: '(6PQBskHxl2Ahc;.',
  readyTimeout: 30000,
};
conn.on('ready', () => {
  console.log('Connected via SSH. Fetching pm2 logs...');
  conn.exec('pm2 logs smlone-backend --lines 100 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect(config);
