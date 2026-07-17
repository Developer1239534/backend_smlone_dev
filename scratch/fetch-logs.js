const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('pm2 logs smlone-backend --lines 50 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).connect({
  host: '194.233.72.69',
  port: 22,
  username: 'root',
  privateKey: fs.readFileSync('C:\\Users\\ASUS ROG\\.ssh\\id_rsa')
});
