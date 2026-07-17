const https = require('https');
const data = JSON.stringify({ username: 'admin', password: 'admin123' });
const options = {
  hostname: 'api.smlone.cloud',
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = https.request(options, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', d));
});
req.write(data);
req.end();
