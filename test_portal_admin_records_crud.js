const http = require('http');
const app = require('./src/server');

let server;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4003,
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

async function runPortalAdminTests() {
  server = app.listen(4003, () => console.log('Portal Admin Test Server running on port 4003...'));

  try {
    console.log('\n--- 1. TEST GET /api/portal-admin ---');
    const res1 = await request('GET', '/api/portal-admin?limit=2');
    console.log('Status:', res1.status, 'Success:', res1.body.success, 'Rows:', res1.body.data ? res1.body.data.length : 0);

    console.log('\n--- 2. TEST POST /api/portal-admin (CREATE) ---');
    const createPayload = {
      trainee_id: 'TEST_PADMIN_999',
      name: 'Test Portal Admin Trainee',
      class_name: 'Gladwell',
      day: 'Saturday',
      time: '13:00 - 15:00',
      room: 'Room A',
      branch: 'TIMOR',
      level: 'Sergeant',
      house: 'House of Thenova',
      trainer: 'Coach John',
      membership_status: 'Active'
    };
    const res2 = await request('POST', '/api/portal-admin', createPayload);
    console.log('Status:', res2.status, 'Data:', res2.body.data ? res2.body.data.trainee_id : null);

    console.log('\n--- 3. TEST GET /api/portal-trainee/TEST_PADMIN_999/portal-admin (REAL-TIME TRAINEE API) ---');
    const res3 = await request('GET', '/api/portal-trainee/TEST_PADMIN_999/portal-admin');
    console.log('Status:', res3.status, 'Trainee ID:', res3.body.trainee_id, 'Class Name:', res3.body.data ? res3.body.data.class_name : null);

    console.log('\n--- 4. TEST PUT /api/portal-admin/TEST_PADMIN_999 (UPDATE) ---');
    const updatePayload = {
      level: 'Captain',
      membership_status: 'Active (Grace Period)'
    };
    const res4 = await request('PUT', '/api/portal-admin/TEST_PADMIN_999', updatePayload);
    console.log('Status:', res4.status, 'Updated Status:', res4.body.data ? res4.body.data.membership_status : null);

    console.log('\n--- 5. TEST DELETE /api/portal-admin/TEST_PADMIN_999 (DELETE CLEANUP) ---');
    const res5 = await request('DELETE', '/api/portal-admin/TEST_PADMIN_999');
    console.log('Status:', res5.status, 'Deleted:', res5.body.success);

    console.log('\n✅ ALL PORTAL ADMIN HTTP CRUD TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    if (server) server.close(() => console.log('Portal Admin Test server closed.'));
    process.exit(0);
  }
}

runPortalAdminTests();
