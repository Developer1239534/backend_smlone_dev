const { Client } = require('ssh2');

const config = {
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'W@p0UxZcg7.b7D@',
  readyTimeout: 30000
};

async function syncVps() {
  const conn = new Client();
  conn.on('ready', async () => {
    console.log('✅ Connected to Production VPS (72.62.2.160)!');

    conn.exec('cd /var/www/backend-smlone && git pull origin main && pm2 restart all', (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        return conn.end();
      }
      stream.on('close', (code) => {
        console.log(`\n🎉 Command finished with exit code ${code}`);
        conn.end();
      }).on('data', (data) => {
        process.stdout.write(data.toString());
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });
    });
  }).on('error', (err) => {
    console.error('❌ SSH Connection Error:', err.message);
  }).connect(config);
}

syncVps();
