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
  console.log('Connected via SSH. Uploading files...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('./src/server.js', '/root/backend_smlone_dev/src/server.js', (err) => {
      if (err) throw err;
      console.log('Uploaded server.js');
      sftp.fastPut('./src/routes/level1TrCleanedTraineeRoutes.js', '/root/backend_smlone_dev/src/routes/level1TrCleanedTraineeRoutes.js', (err) => {
        if (err) throw err;
        console.log('Uploaded level1TrCleanedTraineeRoutes.js');
        console.log('Restarting PM2...');
        conn.exec('cd /root/backend_smlone_dev && pm2 restart smlone-backend', (err, stream) => {
          if (err) throw err;
          stream.on('close', () => {
            console.log('Upload and restart complete!');
            conn.end();
          }).on('data', d => process.stdout.write(d));
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect(config);
