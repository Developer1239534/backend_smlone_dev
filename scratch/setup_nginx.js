const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '187.127.206.193',
  port: 22,
  username: 'root',
  password: '(6PQBskHxl2Ahc;.',
  readyTimeout: 30000,
};

console.log('Connecting to VPS to setup Nginx and SSL...');

conn.on('ready', () => {
  console.log('SSH Connection ready! Running commands...');
  
  const commands = `
    echo "Creating Nginx config..." &&
    cat << 'EOF' > /etc/nginx/sites-available/api.smlone.cloud
server {
    listen 80;
    server_name api.smlone.cloud;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/api.smlone.cloud /etc/nginx/sites-enabled/ &&
    rm -f /etc/nginx/sites-enabled/default &&
    echo "Restarting Nginx..." &&
    systemctl restart nginx &&
    echo "Running Certbot for SSL (HTTPS)..." &&
    certbot --nginx -d api.smlone.cloud --non-interactive --agree-tos -m admin@smlone.cloud --redirect &&
    echo "SSL SETUP COMPLETE!"
  `;

  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect(config);
