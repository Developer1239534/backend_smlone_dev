const { Client } = require('ssh2');

const config = {
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'W@p0UxZcg7.b7D@',
  readyTimeout: 30000
};

async function checkVpsEnv() {
  const conn = new Client();
  conn.on('ready', async () => {
    console.log('✅ Connected to VPS!');
    conn.exec('cat /var/www/backend-smlone/.env', (err, stream) => {
      if (err) return conn.end();
      let stdout = '';
      stream.on('close', () => {
        console.log('VPS .env Contents:\n', stdout);
        conn.end();
      }).on('data', data => stdout += data.toString());
    });
  }).connect(config);
}

checkVpsEnv();
