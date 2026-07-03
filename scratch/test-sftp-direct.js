const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const config = {
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'SmlOneDev2026'
};

const REMOTE_DIR = '/var/www/backend-smlone';

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected!');
  conn.sftp(async (err, sftp) => {
    if (err) {
      console.error('SFTP Init Error:', err);
      conn.end();
      return;
    }
    
    try {
      console.log('SFTP Initialized');
      const rootPath = path.resolve(__dirname, '..');
      
      const uploadFile = (local, remote) => {
        return new Promise((resolve, reject) => {
          console.log(`Uploading ${path.basename(local)}...`);
          sftp.fastPut(local, remote, (err) => {
            if (err) {
              console.error(`Error uploading ${path.basename(local)}:`, err);
              reject(err);
            } else {
              console.log(`Uploaded ${path.basename(local)}`);
              resolve();
            }
          });
        });
      };

      const makeDir = (remoteDir) => {
        return new Promise((resolve) => {
          sftp.mkdir(remoteDir, () => resolve());
        });
      };

      const uploadDirRecursive = async (localDir, remoteDir) => {
        await makeDir(remoteDir);
        const items = fs.readdirSync(localDir);
        for (const item of items) {
          const localPath = path.join(localDir, item);
          const remotePath = path.posix.join(remoteDir, item);
          const stat = fs.statSync(localPath);
          if (stat.isDirectory()) {
            await uploadDirRecursive(localPath, remotePath);
          } else {
            await uploadFile(localPath, remotePath);
          }
        }
      };

      console.log('Starting upload...');
      await uploadDirRecursive(path.join(rootPath, 'src'), `${REMOTE_DIR}/src`);
      console.log('Upload Finished successfully!');
    } catch (e) {
      console.error('Error during upload:', e);
    } finally {
      conn.end();
    }
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish([config.password]);
}).connect({
  ...config,
  tryKeyboard: true
});
