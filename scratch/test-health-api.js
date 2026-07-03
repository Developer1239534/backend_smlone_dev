const http = require('http');

const urls = [
  'http://72.62.2.160/api/health',
  'http://api.smlone.com/api/health'
];

function testUrl(url) {
  return new Promise((resolve) => {
    console.log(`Testing URL: ${url}`);
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ success: true, statusCode: res.statusCode, body: data });
      });
    });
    
    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timed out after 4 seconds' });
    });
  });
}

async function main() {
  for (const url of urls) {
    const result = await testUrl(url);
    console.log(`Result for ${url}:`, result);
  }
}

main();
