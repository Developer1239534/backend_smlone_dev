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
  conn.exec('pm2 logs smlone-backend --lines 50 --nostream', (err, stream) => {
    stream.on('close', () => {
      conn.end();
    }).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
