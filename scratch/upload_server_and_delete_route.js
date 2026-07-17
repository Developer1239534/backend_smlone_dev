const { Client } = require('ssh2');
const fs = require('fs');
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
    
    const file1Local = './src/server.js';
    const file1Remote = '/root/backend_smlone_dev/src/server.js';
    
    sftp.fastPut(file1Local, file1Remote, (err) => {
      if (err) throw err;
      console.log('Updated server.js');
      
      console.log('Removing old route file and restarting server...');
      conn.exec('cd /root/backend_smlone_dev && rm -f src/routes/level1CaClassRoutes.js && pm2 restart smlone-backend', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Server restarted! All done.');
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect(config);
