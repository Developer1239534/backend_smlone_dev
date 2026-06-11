const http = require('http');

const request = (method, path, body) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
};

(async () => {
  try {
    console.log('--- START TEST ---');

    // 1. GET ALL
    console.log('Testing GET /api/admin/quiz-history...');
    const getAll = await request('GET', '/api/admin/quiz-history');
    console.log('GET ALL Status:', getAll.status, 'Count:', getAll.body.count);

    // Clean up test trainee
    console.log('Cleaning up existing test history for student 858...');
    await request('DELETE', '/api/admin/quiz-history/858');

    // 2. POST (Create)
    console.log('Testing POST /api/admin/quiz-history...');
    const testPost = await request('POST', '/api/admin/quiz-history', {
      student_id: '858',
      assigned_house: 'Creanova',
      scores: { A: 1, B: 2, C: 3, D: 4, E: 15 }
    });
    console.log('POST Status:', testPost.status, 'Success:', testPost.body.success);

    // Check if trainee profile was synced
    const profileRes = await request('GET', '/api/dashboard/profile/858');
    console.log('Profile class after POST:', profileRes.body.data.class, 'house_sml:', profileRes.body.data.house_sml);

    // 3. GET Single
    console.log('Testing GET /api/admin/quiz-history/858...');
    const getSingle = await request('GET', '/api/admin/quiz-history/858');
    console.log('GET Single Status:', getSingle.status, 'Success:', getSingle.body.success, 'House:', getSingle.body.data.house_name);

    // 4. PUT (Replace)
    console.log('Testing PUT /api/admin/quiz-history/858...');
    const testPut = await request('PUT', '/api/admin/quiz-history/858', {
      assigned_house: 'Thenova',
      scores: { A: 20, B: 1, C: 2, D: 1, E: 1 }
    });
    console.log('PUT Status:', testPut.status, 'Success:', testPut.body.success);

    // Check profile class synced
    const profileRes2 = await request('GET', '/api/dashboard/profile/858');
    console.log('Profile class after PUT:', profileRes2.body.data.class, 'house_sml:', profileRes2.body.data.house_sml);

    // 5. PATCH (Update)
    console.log('Testing PATCH /api/admin/quiz-history/858...');
    const testPatch = await request('PATCH', '/api/admin/quiz-history/858', {
      assigned_house: 'Havaria'
    });
    console.log('PATCH Status:', testPatch.status, 'Success:', testPatch.body.success);

    // Check profile class synced
    const profileRes3 = await request('GET', '/api/dashboard/profile/858');
    console.log('Profile class after PATCH:', profileRes3.body.data.class, 'house_sml:', profileRes3.body.data.house_sml);

    // 6. DELETE
    console.log('Testing DELETE /api/admin/quiz-history/858...');
    const testDelete = await request('DELETE', '/api/admin/quiz-history/858');
    console.log('DELETE Status:', testDelete.status, 'Success:', testDelete.body.success);

    // Check profile class synced (should be null)
    const profileRes4 = await request('GET', '/api/dashboard/profile/858');
    console.log('Profile class after DELETE:', profileRes4.body.data.class, 'house_sml:', profileRes4.body.data.house_sml);

    console.log('--- TEST FINISHED SUCCESSFULLY ---');
  } catch(e) {
    console.error('Test script error:', e);
  }
})();
