const https = require('https');

function check() {
  https.get('https://api.smlone.cloud/api/health', (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Body:', body);
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

check();
