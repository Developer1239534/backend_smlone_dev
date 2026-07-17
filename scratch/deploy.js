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

const localFile = 'backend_smlone_dev.zip';
const remoteFile = '/root/backend_smlone_dev.zip';

console.log('Connecting to VPS...');

conn.on('ready', () => {
  console.log('SSH Connection ready! Transferring file...');
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('File transferred successfully!');
      
      const commands = `
        echo "Unzipping code..." &&
        rm -rf backend_smlone_dev &&
        unzip -q backend_smlone_dev.zip -d backend_smlone_dev && 
        cd backend_smlone_dev && 
        echo "Running npm install on VPS..." &&
        npm install && 
        echo "Starting PM2..." &&
        pm2 restart smlone-backend || pm2 start src/server.js --name smlone-backend &&
        pm2 save &&
        echo "ALL DONE!"
      `;

      console.log('Running setup commands on VPS. This might take a few minutes...');
      
      conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
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
