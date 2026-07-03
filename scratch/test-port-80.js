const http = require('http');

http.get('http://72.62.2.160/api/health', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('HTTP 80 Result:', res.statusCode, data);
  });
}).on('error', (err) => {
  console.error('HTTP 80 Error:', err.message);
});
