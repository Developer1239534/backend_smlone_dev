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

async function main() {
  let conn;
  try {
    console.log('Connecting to VPS...');
    conn = await connectSSH();
    console.log('Connected via SSH successfully.');

    console.log('Installing Certbot and Nginx Certbot plugin...');
    await runCommand(conn, 'apt-get update && apt-get install -y certbot python3-certbot-nginx');

    console.log('Obtaining Let\'s Encrypt SSL Certificate for api.smlone.com...');
    // We request the cert and configure Nginx to use it, with redirection to HTTPS
    await runCommand(conn, 'certbot --nginx -d api.smlone.com --non-interactive --agree-tos --email smlone.dev@gmail.com --redirect');

    console.log('Reloading Nginx to apply changes...');
    await runCommand(conn, 'systemctl reload nginx');

    console.log('\n=============================================');
    console.log('🔒 SSL / HTTPS SUCCESSFULLY CONFIGURED FOR api.smlone.com!');
    console.log('=============================================\n');

  } catch (err) {
    console.error('❌ SSL configuration error:', err);
  } finally {
    if (conn) conn.end();
  }
}

main();
