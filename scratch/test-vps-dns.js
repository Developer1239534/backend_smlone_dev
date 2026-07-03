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
    conn = await connectSSH();
    console.log('--- Resolv.conf ---');
    await runCommand(conn, 'cat /etc/resolv.conf');
    
    console.log('--- Ping google.com ---');
    await runCommand(conn, 'ping -c 3 google.com || echo "Ping failed"');

    console.log('--- Ping Neon Domain ---');
    await runCommand(conn, 'ping -c 3 ep-muddy-bar-aojszwfn-pooler.c-2.ap-southeast-1.aws.neon.tech || echo "Ping neon failed"');
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.end();
  }
}

main();
