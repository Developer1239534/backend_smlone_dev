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
  conn.sftp((err, sftp) => {
    sftp.fastPut('./src/routes/level1CaCleanedTraineeRoutes.js', '/root/backend_smlone_dev/src/routes/level1CaCleanedTraineeRoutes.js', () => {
      conn.exec('cd /root/backend_smlone_dev && pm2 restart smlone-backend', (err, stream) => {
        stream.on('close', () => {
          console.log('Upload and restart complete.');
          conn.end();
        }).on('data', d => process.stdout.write(d));
      });
    });
  });
}).connect(config);
