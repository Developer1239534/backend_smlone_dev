const { Client } = require('ssh2');

const config = {
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'W@p0UxZcg7.b7D@'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  
  // 1. Cek isi .env (apakah sudah ada ABLY_API_KEY?)
  // 2. Tambahkan jika belum ada.
  // 3. Restart PM2 dengan --update-env
  
  const cmd = `
    grep -q "ABLY_API_KEY" /root/backend_smlone_dev/.env || echo "ABLY_API_KEY=9xE97w.eZA9xg:1YhIFkNQ0qqAEKg7KIqmPbBprxIGa5L57KqOEAn2-eI" >> /root/backend_smlone_dev/.env
    pm2 restart all --update-env
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect(config);
