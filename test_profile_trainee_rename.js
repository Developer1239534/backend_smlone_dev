const http = require('http');
process.env.NODE_ENV = 'development';
require('dotenv').config();
const app = require('./src/server');

let server;

(async () => {
  server = app.listen(4005, async () => {
    console.log('🧪 Server running on 4005, testing renamed table profile_trainee & endpoints...\n');

    function makeRequest(path, method = 'GET', body = null) {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 4005,
          path,
          method,
          headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
      });
    }

    try {
      // 1. GET /api/profile-trainee/980
      const r1 = await makeRequest('/api/profile-trainee/980');
      console.log('1. GET /api/profile-trainee/980 -> Status:', r1.status);
      console.log('   Data:', r1.data?.data?.name, '| Class:', r1.data?.data?.class_name);

      // 2. GET /api/portal-admin/980
      const r2 = await makeRequest('/api/portal-admin/980');
      console.log('2. GET /api/portal-admin/980 -> Status:', r2.status);
      console.log('   Data:', r2.data?.data?.name, '| Class:', r2.data?.data?.class_name);

      // 3. GET /api/portal-trainee/980/profile-trainee
      const r3 = await makeRequest('/api/portal-trainee/980/profile-trainee');
      console.log('3. GET /api/portal-trainee/980/profile-trainee -> Status:', r3.status);
      console.log('   Data:', r3.data?.data?.name);

      // 4. POST /api/tabel-login-trainee/login
      const r4 = await makeRequest('/api/tabel-login-trainee/login', 'POST', { trainee_id: '980', password: 'SML980' });
      console.log('4. POST /api/tabel-login-trainee/login -> Status:', r4.status);
      console.log('   Success:', r4.data?.success, '| Trainee:', r4.data?.data?.nama);
      console.log('   profile_trainee:', r4.data?.data?.profile_trainee?.name);

      console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    } catch (err) {
      console.error(err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
})();
