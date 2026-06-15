const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function test() {
  console.log('Testing GET /dashboard/reports/real-stage/863...');
  const res1 = await get('http://localhost:4000/dashboard/reports/real-stage/863');
  console.log('GET reports status:', res1.status);
  console.log('GET reports body:', JSON.stringify(res1.body, null, 2));

  console.log('\nTesting POST /admin/reports/real-stage...');
  const testPayload = {
    id: '863',
    periode: 'Real Stage 50',
    url: 'https://drive.google.com/file/d/test-real-stage-50/view'
  };
  const res2 = await post('http://localhost:4000/admin/reports/real-stage', testPayload);
  console.log('POST status:', res2.status);
  console.log('POST body:', JSON.stringify(res2.body, null, 2));

  console.log('\nRe-Testing GET /dashboard/reports/real-stage/863 after upload...');
  const res3 = await get('http://localhost:4000/dashboard/reports/real-stage/863');
  console.log('GET reports body:', JSON.stringify(res3.body, null, 2));
}

test().catch(console.error);
