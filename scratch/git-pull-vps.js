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

    console.log('🔄 Checking git status on VPS...');
    const gitStatus = await runCommand(conn, 'cd /var/www/backend-smlone && git status');
    console.log('Git Status:\n', gitStatus.stdout || gitStatus.stderr);

    console.log('🔄 Pulling latest changes from Git...');
    const gitPull = await runCommand(conn, 'cd /var/www/backend-smlone && git pull');
    console.log('Git Pull Output:\n', gitPull.stdout || gitPull.stderr);

    console.log('🔄 Restarting backend process in PM2...');
    const pm2Restart = await runCommand(conn, 'pm2 restart all');
    console.log('PM2 Output:\n', pm2Restart.stdout || pm2Restart.stderr);

  } catch (err) {
    console.error('❌ SSH Error:', err.message);
  } finally {
    if (conn) conn.end();
  }
}

main();
