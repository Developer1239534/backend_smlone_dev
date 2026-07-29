const https = require('https');

function testLogin(urlPath, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.smlone.cloud',
      port: 443,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log('Testing POST https://api.smlone.cloud/api/auth/login ...');
  const res1 = await testLogin('/api/auth/login', { username: 'super@smlone.id', password: 'super123' });
  console.log('Status:', res1.statusCode);
  console.log('Headers:', res1.headers);
  console.log('Body:', res1.body);

  console.log('\nTesting POST https://api.smlone.cloud/api/admin/login ...');
  const res2 = await testLogin('/api/admin/login', { username: 'super@smlone.id', password: 'super123' });
  console.log('Status:', res2.statusCode);
  console.log('Headers:', res2.headers);
  console.log('Body:', res2.body);
}

runTest();
