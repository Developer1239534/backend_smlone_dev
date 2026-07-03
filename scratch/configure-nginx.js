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

function getSftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
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
    console.log('Connecting to VPS to configure Nginx...');
    conn = await connectSSH();
    console.log('Connected.');

    // 1. Install Nginx
    console.log('Installing Nginx on VPS...');
    await runCommand(conn, 'apt-get update && apt-get install -y nginx');

    // 2. Write Nginx configuration for default reverse proxy via SFTP
    console.log('Initializing SFTP...');
    const sftp = await getSftp(conn);

    console.log('Writing Nginx default site config...');
    const nginxConfig = `
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
`.trim();

    await new Promise((resolve, reject) => {
      const stream = sftp.createWriteStream('/etc/nginx/sites-available/default');
      stream.on('close', resolve);
      stream.on('error', reject);
      stream.write(nginxConfig);
      stream.end();
    });
    console.log('Nginx config written successfully via SFTP.');

    // 3. Restart Nginx to apply changes
    console.log('Restarting Nginx service...');
    await runCommand(conn, 'systemctl restart nginx');

    // 4. Verify Nginx port 80 is listening
    console.log('Verifying port 80 is listening...');
    const portCheck = await runCommand(conn, 'ss -lntp | grep :80');
    console.log('Port 80 status:', portCheck);

    console.log('\n=============================================');
    console.log('🌐 NGINX REVERSE PROXY CONFIGURED ON PORT 80!');
    console.log('You can now open: http://72.62.2.160/api/dashboard-trainee');
    console.log('=============================================\n');

  } catch (err) {
    console.error('❌ Nginx configuration failed:', err);
  } finally {
    if (conn) conn.end();
  }
}

main();
