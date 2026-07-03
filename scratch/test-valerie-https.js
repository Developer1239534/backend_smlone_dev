const https = require('https');

https.get('https://api.smlone.com/api/dashboard-trainee/27', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const obj = JSON.parse(data);
      console.log('Valerie ID 27 Profile Result:', obj.success);
      console.log('Trainee Name:', obj.data.trainee_name);
      console.log('Total Gold Periode:', obj.data.total_gold_periode);
    } catch (e) {
      console.log('Failed to parse:', data);
    }
  });
}).on('error', (err) => {
  console.error('HTTPS Error:', err.message);
});
