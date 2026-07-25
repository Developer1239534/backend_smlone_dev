const https = require('https');

const options = {
  hostname: 'api.smlone.cloud',
  path: '/api/webhook/registrasi-ca',
  method: 'GET',
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
