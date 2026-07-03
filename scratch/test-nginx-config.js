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
  return new Promise((resolve) => {
    console.log(`Executing: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error(err);
        return resolve();
      }
      stream.on('close', (code) => {
        console.log(`Closed with code ${code}`);
        resolve();
      }).on('data', (data) => {
        process.stdout.write(data.toString());
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });
    });
  });
}

async function main() {
  let conn;
  try {
    conn = await connectSSH();
    await runCommand(conn, 'nginx -t');
    await runCommand(conn, 'systemctl status nginx.service -n 50');
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.end();
  }
}

main();
