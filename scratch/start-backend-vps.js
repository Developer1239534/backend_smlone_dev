const { Client } = require('ssh2');

const config = {
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'SmlOneDev2026'
};

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
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

async function main() {
  let conn;
  try {
    conn = await connectSSH();
    console.log('✅ Connected to VPS via SSH!');

    console.log('🔄 Checking PM2 status...');
    const pm2Status = await runCommand(conn, 'pm2 status');
    console.log('PM2 Output:', pm2Status.stdout || pm2Status.stderr);

    console.log('🔄 Checking if port 4000 is occupied...');
    const portStatus = await runCommand(conn, 'ss -lntp | grep 4000');
    console.log('Port 4000 status:', portStatus.stdout);

    if (!portStatus.stdout.includes('4000')) {
      console.log('⚠️ Backend not running on Port 4000. Starting it with PM2...');
      const startResult = await runCommand(conn, 'cd /var/www/backend-smlone && pm2 start src/server.js --name smlone-backend');
      console.log('PM2 Start Output:', startResult.stdout || startResult.stderr);
      
      console.log('💾 Saving PM2 state for auto-reboot...');
      const saveResult = await runCommand(conn, 'pm2 save');
      console.log('PM2 Save Output:', saveResult.stdout);
    } else {
      console.log('✅ Backend is already running on Port 4000.');
    }

  } catch (err) {
    console.error('❌ SSH Error:', err.message);
  } finally {
    if (conn) conn.end();
  }
}

main();
