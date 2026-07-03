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

function connectSSH() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn))
        .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
          finish([config.password]);
        })
        .on('error', reject)
        .connect({
          ...config,
          tryKeyboard: true
        });
  });
}

function runCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        if (code !== 0) {
          console.error(`Command failed with code ${code}. Stderr: ${stderr}`);
          reject(new Error(`Command failed: ${cmd}`));
        } else {
          resolve(stdout);
        }
      }).on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      }).stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
    });
  });
}

function getSftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
    });
  });
}

function makeDirSftp(sftp, pathStr) {
  return new Promise((resolve) => {
    sftp.mkdir(pathStr, (err) => {
      // Ignore error if directory already exists
      resolve();
    });
  });
}

function uploadFileSftp(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function uploadDirectory(sftp, localDir, remoteDir) {
  await makeDirSftp(sftp, remoteDir);
  const items = fs.readdirSync(localDir);
  for (const item of items) {
    const localPath = path.join(localDir, item);
    const remotePath = path.posix.join(remoteDir, item);
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      await uploadDirectory(sftp, localPath, remotePath);
    } else {
      await uploadFileSftp(sftp, localPath, remotePath);
    }
  }
}

async function main() {
  let conn;
  try {
    console.log('Connecting to VPS...');
    conn = await connectSSH();
    console.log('Connected via SSH successfully.');

    // 1. Prepare VPS base system (Install Node, Git, PM2)
    console.log('Preparing VPS runtime environment...');
    await runCommand(conn, 'apt-get update && apt-get install -y curl git');

    // Check Node.js
    let nodeInstalled = false;
    try {
      await runCommand(conn, 'node -v');
      nodeInstalled = true;
    } catch (e) {}

    if (!nodeInstalled) {
      console.log('Installing Node.js 20 LTS on VPS...');
      await runCommand(conn, 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -');
      await runCommand(conn, 'apt-get install -y nodejs');
    }

    // Check PM2
    let pm2Installed = false;
    try {
      await runCommand(conn, 'pm2 -v');
      pm2Installed = true;
    } catch (e) {}

    if (!pm2Installed) {
      console.log('Installing PM2 globally...');
      await runCommand(conn, 'npm install -g pm2');
    }

    // 2. Prepare remote directory
    await runCommand(conn, `mkdir -p ${REMOTE_DIR}`);

    // 3. Upload project files via SFTP
    console.log('Initializing SFTP...');
    const sftp = await getSftp(conn);

    console.log('Uploading package files and configuration...');
    const rootPath = path.resolve(__dirname, '..');
    
    await uploadFileSftp(sftp, path.join(rootPath, 'package.json'), `${REMOTE_DIR}/package.json`);
    await uploadFileSftp(sftp, path.join(rootPath, 'package-lock.json'), `${REMOTE_DIR}/package-lock.json`);
    await uploadFileSftp(sftp, path.join(rootPath, '.env'), `${REMOTE_DIR}/.env`);

    console.log('Uploading src directory recursively...');
    await uploadDirectory(sftp, path.join(rootPath, 'src'), `${REMOTE_DIR}/src`);
    console.log('SFTP Upload completed successfully.');

    // 4. Install production dependencies and start server
    console.log('Installing production dependencies on VPS...');
    await runCommand(conn, `cd ${REMOTE_DIR} && npm install --production`);

    console.log('Starting/Restarting application with PM2...');
    // Try to stop first if already running, ignore error if not exists
    try {
      await runCommand(conn, `pm2 delete smlone-backend`);
    } catch (e) {}

    await runCommand(conn, `cd ${REMOTE_DIR} && pm2 start src/server.js --name "smlone-backend"`);
    await runCommand(conn, 'pm2 save');

    // 5. Verify backend is running on port 4000
    console.log('Verifying backend is listening on port 4000...');
    const netstat = await runCommand(conn, 'ss -lntp | grep 4000');
    console.log('Verification Output:', netstat);

    console.log('\n=============================================');
    console.log('🚀 BACKEND SUCCESSFULLY DEPLOYED TO HOSTINGER VPS!');
    console.log('=============================================\n');

  } catch (err) {
    console.error('❌ Deployment error:', err);
  } finally {
    if (conn) conn.end();
  }
}

main();
