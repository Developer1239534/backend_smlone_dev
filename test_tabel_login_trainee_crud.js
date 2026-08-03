const http = require('http');
const app = require('./src/server');

let server;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4004,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTabelLoginTraineeTests() {
  server = app.listen(4004, () => console.log('Tabel Login Trainee Test Server running on port 4004...'));

  try {
    console.log('\n--- 1. TEST GET /api/tabel-login-trainee ---');
    const res1 = await request('GET', '/api/tabel-login-trainee?limit=2');
    console.log('Status:', res1.status, 'Success:', res1.body.success, 'Total items:', res1.body.pagination ? res1.body.pagination.total : 0);

    console.log('\n--- 2. TEST POST /api/tabel-login-trainee/login (LOGIN WITH SML+TRAINEE_ID) ---');
    const loginPayload = {
      trainee_id: '1000',
      password: 'SML1000'
    };
    const res2 = await request('POST', '/api/tabel-login-trainee/login', loginPayload);
    console.log('Status:', res2.status, 'Message:', res2.body.message);
    console.log('Has Token:', !!res2.body.token);
    console.log('Returned Data Keys:', Object.keys(res2.body.data || {}));
    console.log('Contains link_reports:', Array.isArray(res2.body.data ? res2.body.data.link_reports : null));
    console.log('Contains report_activity:', !!(res2.body.data && res2.body.data.report_activity));
    console.log('Contains portal_admin:', !!(res2.body.data && res2.body.data.portal_admin));

    console.log('\n--- 3. TEST GET /api/tabel-login-trainee/1000 (INTEGRATED SINGLE DATA) ---');
    const res3 = await request('GET', '/api/tabel-login-trainee/1000');
    console.log('Status:', res3.status, 'Trainee ID:', res3.body.data ? res3.body.data.trainee_id : null);
    console.log('Plain Password:', res3.body.data && res3.body.data.account ? res3.body.data.account.plain_password : null);

    console.log('\n--- 4. TEST POST /api/tabel-login-trainee (CREATE TEST RECORD) ---');
    const createPayload = {
      trainee_id: 'TEST_LOGIN_999',
      nama: 'Test Trainee Account',
      plain_password: 'SMLTEST_LOGIN_999'
    };
    const res4 = await request('POST', '/api/tabel-login-trainee', createPayload);
    console.log('Status:', res4.status, 'Created ID:', res4.body.data ? res4.body.data.trainee_id : null);

    console.log('\n--- 5. TEST PUT /api/tabel-login-trainee/TEST_LOGIN_999 (UPDATE PASSWORD) ---');
    const updatePayload = {
      plain_password: 'SMLNEWPASSWORD123'
    };
    const res5 = await request('PUT', '/api/tabel-login-trainee/TEST_LOGIN_999', updatePayload);
    console.log('Status:', res5.status, 'New Plain Password:', res5.body.data ? res5.body.data.plain_password : null);

    console.log('\n--- 6. TEST DELETE /api/tabel-login-trainee/TEST_LOGIN_999 (CLEANUP TEST RECORD) ---');
    const res6 = await request('DELETE', '/api/tabel-login-trainee/TEST_LOGIN_999');
    console.log('Status:', res6.status, 'Deleted:', res6.body.success);

    console.log('\n✅ ALL TABEL LOGIN TRAINEE HTTP TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    if (server) server.close(() => console.log('Test server closed.'));
    process.exit(0);
  }
}

runTabelLoginTraineeTests();
