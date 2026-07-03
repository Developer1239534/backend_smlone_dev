const http = require('http');

function testUrl(url) {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ success: true, statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ success: true, statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => resolve({ success: false, error: err.message }));
  });
}

async function main() {
  const r1 = await testUrl('http://api.smlone.com/api/dashboard-trainee/house-rank');
  console.log('House Rank Result Count:', r1.data ? r1.data.count : 'Error', 'Data sample:', r1.data ? r1.data.data.slice(0, 2) : '');

  const r2 = await testUrl('http://api.smlone.com/api/dashboard-trainee/970/gp-tahunan');
  console.log('GP Tahunan (ID 970) Result Count:', r2.data ? r2.data.count : 'Error', 'Data sample:', r2.data ? r2.data.data.slice(0, 2) : '');
}

main();
