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
  console.log('Testing GET /dashboard/reports/482...');
  const res1 = await get('http://localhost:4000/dashboard/reports/482');
  console.log('GET reports status:', res1.status);
  console.log('GET reports body:', JSON.stringify(res1.body, null, 2));

  console.log('\nTesting GET /dashboard/reports/previous/482...');
  const res2 = await get('http://localhost:4000/dashboard/reports/previous/482');
  console.log('GET previous reports status:', res2.status);
  console.log('GET previous reports body:', JSON.stringify(res2.body, null, 2));

  console.log('\nTesting POST /admin/reports/quarterly...');
  const testPayload = {
    id: '482',
    periode: 'Oct - Dec 2026',
    url: 'https://docs.google.com/document/d/test-url-12345/edit'
  };
  const res3 = await post('http://localhost:4000/admin/reports/quarterly', testPayload);
  console.log('POST status:', res3.status);
  console.log('POST body:', JSON.stringify(res3.body, null, 2));

  console.log('\nRe-Testing GET /dashboard/reports/482 after upload...');
  const res4 = await get('http://localhost:4000/dashboard/reports/482');
  console.log('GET reports body:', JSON.stringify(res4.body, null, 2));
}

test().catch(console.error);
