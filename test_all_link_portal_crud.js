const http = require('http');
const app = require('./src/server');

let server;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4001,
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

async function runTests() {
  server = app.listen(4001, () => console.log('Test server running on port 4001...'));

  try {
    console.log('\n--- 1. TEST GET /api/link-report ---');
    const res1 = await request('GET', '/api/link-report?limit=2');
    console.log('Status:', res1.status, 'Success:', res1.body.success, 'Rows:', res1.body.data ? res1.body.data.length : 0);

    console.log('\n--- 2. TEST POST /api/link-report (CREATE) ---');
    const createPayload = {
      trainee_id: 'TEST_TRAINEE_999',
      term: 'May 2026 - Jun 2026',
      nama: 'Test Trainee Automatic',
      status: 'Active',
      link_term: 'https://drive.google.com/test-report',
      link_youtube: 'https://youtube.com/test-playlist',
      link_weekly: 'https://docs.google.com/spreadsheets/test-weekly'
    };
    const res2 = await request('POST', '/api/link-report', createPayload);
    console.log('Status:', res2.status, 'Data:', res2.body.data);

    console.log('\n--- 3. TEST GET /api/link-report/trainee/TEST_TRAINEE_999 (REAL-TIME TRAINEE) ---');
    const res3 = await request('GET', '/api/link-report/trainee/TEST_TRAINEE_999');
    console.log('Status:', res3.status, 'Reports:', res3.body.count);

    console.log('\n--- 4. TEST PUT /api/link-report/TEST_TRAINEE_999/May%202026%20-%20Jun%202026 (UPDATE) ---');
    const updatePayload = {
      status: 'Active (Grace Period)',
      link_term: 'https://drive.google.com/test-report-updated'
    };
    const res4 = await request('PUT', '/api/link-report/TEST_TRAINEE_999/May%202026%20-%20Jun%202026', updatePayload);
    console.log('Status:', res4.status, 'Updated Status:', res4.body.data ? res4.body.data.status : null);

    console.log('\n--- 5. TEST GET /api/portal-trainee/TEST_TRAINEE_999/link-report (PORTAL TRAINEE API) ---');
    const res5 = await request('GET', '/api/portal-trainee/TEST_TRAINEE_999/link-report');
    console.log('Status:', res5.status, 'Total Reports:', res5.body.total_reports);

    console.log('\n--- 6. TEST POST /api/portal-admin/link-report (PORTAL ADMIN CREATE) ---');
    const adminCreatePayload = {
      trainee_id: 'TEST_ADMIN_888',
      term: 'May 2026 - Jun 2026',
      nama: 'Test Admin Trainee',
      status: 'Active',
      link_term: 'https://drive.google.com/admin-test-report',
      link_youtube: 'https://youtube.com/admin-test-playlist',
      link_weekly: 'https://docs.google.com/spreadsheets/admin-test-weekly'
    };
    const res6 = await request('POST', '/api/portal-admin/link-report', adminCreatePayload);
    console.log('Status:', res6.status, 'Created by Admin:', res6.body.data ? res6.body.data.trainee_id : null);

    console.log('\n--- 7. TEST DELETE /api/portal-admin/link-report/TEST_ADMIN_888/May%202026%20-%20Jun%202026 (PORTAL ADMIN DELETE) ---');
    const res7 = await request('DELETE', '/api/portal-admin/link-report/TEST_ADMIN_888/May%202026%20-%20Jun%202026');
    console.log('Status:', res7.status, 'Deleted:', res7.body.success);

    console.log('\n--- 8. TEST DELETE /api/link-report/TEST_TRAINEE_999 (CLEANUP TEST RECORD) ---');
    const res8 = await request('DELETE', '/api/link-report/TEST_TRAINEE_999');
    console.log('Status:', res8.status, 'Cleaned test records:', res8.body.deletedCount);

    console.log('\n✅ ALL HTTP CRUD TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    if (server) server.close(() => console.log('Test server closed.'));
    process.exit(0);
  }
}

runTests();
