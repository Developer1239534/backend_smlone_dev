const http = require('http');
const app = require('./src/server');

const server = app.listen(4005, async () => {
  console.log('Test server running on port 4005');

  const postData = JSON.stringify({ username: 'super@smlone.id', password: 'super123' });
  const options = {
    hostname: 'localhost',
    port: 4005,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', body);
      server.close(() => process.exit(0));
    });
  });

  req.on('error', (e) => {
    console.error(e);
    server.close(() => process.exit(1));
  });

  req.write(postData);
  req.end();
});
