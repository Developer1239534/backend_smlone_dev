const https = require('https');

https.get('https://api.smlone.com/api/health', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('HTTPS Health Result:', res.statusCode, data);
  });
}).on('error', (err) => {
  console.error('HTTPS Error:', err.message);
});
