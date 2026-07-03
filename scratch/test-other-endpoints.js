const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}`);
        resolve(res.statusCode);
      });
    }).on('error', (err) => {
      console.log(`URL: ${url} -> Error: ${err.message}`);
      resolve(null);
    });
  });
}

async function main() {
  await testUrl('https://api.smlone.com/api/students/27');
  await testUrl('https://api.smlone.com/api/dashboard/awards/grouped?period=jun-2026');
  await testUrl('https://api.smlone.com/dashboard/speaking-projects/27');
  await testUrl('https://api.smlone.com/dashboard/reports/real-stage/27');
  await testUrl('https://api.smlone.com/dashboard/reports/quarterly/27');
  await testUrl('https://api.smlone.com/dashboard/contact/27');
}

main();
