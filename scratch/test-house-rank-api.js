const https = require('https');

https.get('https://api.smlone.com/api/dashboard-trainee/house-rank', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const obj = JSON.parse(data);
      console.log('House Rank API Response status:', obj.success);
      console.log('Data:', obj.data);
    } catch (e) {
      console.log('Parse error:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
