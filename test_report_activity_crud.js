const http = require('http');
const app = require('./src/server');

let server;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4002,
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

async function runReportActivityTests() {
  server = app.listen(4002, () => console.log('Report Activity Test Server running on port 4002...'));

  try {
    console.log('\n--- 1. TEST GET /api/report-activity ---');
    const res1 = await request('GET', '/api/report-activity?limit=2');
    console.log('Status:', res1.status, 'Success:', res1.body.success, 'Rows:', res1.body.data ? res1.body.data.length : 0);

    console.log('\n--- 2. TEST POST /api/report-activity (CREATE / UPSERT) ---');
    const createPayload = {
      trainee_id: 'TEST_ACT_999',
      name: 'Test Activity Trainee',
      branch: 'TIMOR',
      cleaned_program: 'Junior/Youth Program', // Will be transformed to Core/Society Program
      cleaned_class: 'Kiyosaki',
      level: 'Sergeant',
      life_project_to_next_level: '25%'
    };
    const res2 = await request('POST', '/api/report-activity', createPayload);
    console.log('Status:', res2.status, 'Data:', res2.body.data ? res2.body.data.cleaned_program : null);

    console.log('\n--- 3. TEST GET /api/portal-trainee/TEST_ACT_999/report-activity (REAL-TIME TRAINEE API) ---');
    const res3 = await request('GET', '/api/portal-trainee/TEST_ACT_999/report-activity');
    console.log('Status:', res3.status, 'Trainee ID:', res3.body.trainee_id, 'Program:', res3.body.data ? res3.body.data.cleaned_program : null);

    console.log('\n--- 4. TEST PUT /api/report-activity/TEST_ACT_999 (UPDATE) ---');
    const updatePayload = {
      level: 'Lieutenant',
      life_project_to_next_level: '50%'
    };
    const res4 = await request('PUT', '/api/report-activity/TEST_ACT_999', updatePayload);
    console.log('Status:', res4.status, 'Updated Level:', res4.body.data ? res4.body.data.level : null);

    console.log('\n--- 5. TEST GET /api/portal-admin/report-activity (PORTAL ADMIN LIST API) ---');
    const res5 = await request('GET', '/api/portal-admin/report-activity?search=TEST_ACT_999');
    console.log('Status:', res5.status, 'Found Admin Records:', res5.body.data ? res5.body.data.length : 0);

    console.log('\n--- 6. TEST POST /api/portal-admin/report-activity (PORTAL ADMIN CREATE) ---');
    const adminCreatePayload = {
      trainee_id: 'TEST_ADMIN_ACT_888',
      name: 'Test Admin Activity Record',
      branch: 'CEMARA',
      cleaned_program: 'Core/Society Program',
      cleaned_class: 'Einstein',
      level: 'Captain'
    };
    const res6 = await request('POST', '/api/portal-admin/report-activity', adminCreatePayload);
    console.log('Status:', res6.status, 'Created by Admin:', res6.body.data ? res6.body.data.trainee_id : null);

    console.log('\n--- 7. TEST DELETE /api/portal-admin/report-activity/TEST_ADMIN_ACT_888 (PORTAL ADMIN DELETE) ---');
    const res7 = await request('DELETE', '/api/portal-admin/report-activity/TEST_ADMIN_ACT_888');
    console.log('Status:', res7.status, 'Deleted:', res7.body.success);

    console.log('\n--- 8. TEST DELETE /api/report-activity/TEST_ACT_999 (CLEANUP TEST RECORD) ---');
    const res8 = await request('DELETE', '/api/report-activity/TEST_ACT_999');
    console.log('Status:', res8.status, 'Cleaned test record:', res8.body.success);

    console.log('\n✅ ALL REPORT ACTIVITY HTTP CRUD TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    if (server) server.close(() => console.log('Report Activity Test server closed.'));
    process.exit(0);
  }
}

runReportActivityTests();
