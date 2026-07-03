const http = require('http');

http.get('http://localhost:4000/api/dashboard/reports/real-stage/863', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', JSON.stringify(JSON.parse(data), null, 2));
    process.exit(0);
  });
}).on('error', (err) => {
  console.error(err);
  process.exit(1);
});
