const https = require('https');

const data = JSON.stringify({
  "Timestamp": "8/5/2022 15:38:16",
  "Email Address": "test_agent@smlone.com",
  "Full Name": "Test Agent",
});

const options = {
  hostname: 'api.smlone.cloud',
  port: 445, // wait, no port or 443 for https
  path: '/api/webhook/registrasi-ca/push',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'smlone-n8n-secret-key-2026',
    'Content-Length': data.length
  }
};

const req = https.request({ ...options, port: 443 }, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
