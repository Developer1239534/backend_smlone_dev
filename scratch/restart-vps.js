const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cd /root/backend_smlone_dev && git fetch --all && git reset --hard origin/main && pm2 restart 0', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', data => console.log(data.toString()))
      .stderr.on('data', data => console.error(data.toString()));
  });
}).connect({ host: '187.127.206.193', port: 22, username: 'root', password: '04@-S@9cPC&2l4@e', tryKeyboard: true, readyTimeout: 30000 });
