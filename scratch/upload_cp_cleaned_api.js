const { Client } = require('ssh2');
const conn = new Client();
const config = {
  host: '187.127.206.193',
  port: 22,
  username: 'root',
  password: '(6PQBskHxl2Ahc;.',
  readyTimeout: 30000,
};

console.log('Connecting to VPS...');
conn.on('ready', () => {
  console.log('SSH Connection ready! Transferring updated files...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('./src/server.js', '/root/backend_smlone_dev/src/server.js', (err) => {
      if (err) throw err;
      console.log('Updated server.js');
      sftp.fastPut('./src/routes/level1CpCleanedTraineeRoutes.js', '/root/backend_smlone_dev/src/routes/level1CpCleanedTraineeRoutes.js', (err) => {
        if (err) throw err;
        console.log('Uploaded level1CpCleanedTraineeRoutes.js');
        console.log('Restarting server...');
        conn.exec('cd /root/backend_smlone_dev && pm2 restart smlone-backend', (err, stream) => {
          if (err) throw err;
          stream.on('close', () => {
            console.log('Server restarted! All done.');
            conn.end();
          }).on('data', d => process.stdout.write(d));
        });
      });
    });
  });
}).connect(config);
