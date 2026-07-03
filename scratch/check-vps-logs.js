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
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

async function main() {
  let conn;
  try {
    console.log('Connecting to VPS...');
    conn = await connectSSH();
    console.log('Connected.');

    console.log('\n--- PM2 Error Log (last 30 lines) ---');
    const errLog = await runCommand(conn, 'tail -n 30 /root/.pm2/logs/smlone-backend-error.log');
    console.log(errLog.stdout);
    console.log(errLog.stderr);

    console.log('\n--- PM2 Out Log (last 30 lines) ---');
    const outLog = await runCommand(conn, 'tail -n 30 /root/.pm2/logs/smlone-backend-out.log');
    console.log(outLog.stdout);
    console.log(outLog.stderr);

    console.log('\n--- Env File presence check ---');
    const envCheck = await runCommand(conn, 'cat /var/www/backend-smlone/.env | grep -E "DATABASE_URL|CLOUDINARY"');
    console.log(envCheck.stdout);

  } catch (err) {
    console.error('❌ Failed to fetch logs:', err);
  } finally {
    if (conn) conn.end();
  }
}

main();
