const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('grep -i "ably" /root/.pm2/logs/smlone-backend-error.log', (err, stream) => {
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
