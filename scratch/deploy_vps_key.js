const { Client } = require('ssh2');
const fs = require('fs');

const config = {
  host: '194.233.72.69',
  port: 22,
  username: 'root',
  privateKey: fs.readFileSync('C:\\Users\\ASUS ROG\\.ssh\\id_ed25519'),
  readyTimeout: 30000
};

function connectSSH() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn))
        .on('error', reject)
        .connect(config);
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
        resolve({ code, stdout, stderr });
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

async function main() {
  let conn;
  try {
    console.log('Connecting to VPS 194.233.72.69 using SSH Key...');
    conn = await connectSSH();
    console.log('✅ Connected to VPS via SSH successfully!');

    console.log('🔄 Pulling latest changes from GitHub on VPS...');
    const pullRes = await runCommand(conn, 'cd /var/www/backend-smlone && git pull');
    
    console.log('🔄 Restarting backend process in PM2...');
    const pm2Res = await runCommand(conn, 'pm2 restart smlone-backend || pm2 restart all');
    
    console.log('✅ VPS deployment and restart completed!');
  } catch (err) {
    console.error('❌ SSH Error:', err);
  } finally {
    if (conn) conn.end();
  }
}

main();
