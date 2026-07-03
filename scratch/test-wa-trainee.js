const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function request(url, method, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const req = http.request(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function test() {
  const traineeId = '482'; // using the trainee id from previous tests
  console.log(`[Test] 1. GET current profile for trainee ${traineeId}...`);
  const profileRes = await get(`http://localhost:4000/dashboard/profile/${traineeId}`);
  console.log('GET profile status:', profileRes.status);
  if (profileRes.status !== 200) {
    console.error('Failed to get profile:', profileRes.body);
    process.exit(1);
  }
  const originalWaTrainee = profileRes.body.data.wa_trainee;
  console.log('Current wa_trainee:', originalWaTrainee);

  console.log('\n[Test] 2. PATCH student update endpoint /api/students/:id with wa_trainee...');
  const patchRes1 = await request(
    `http://localhost:4000/api/students/${traineeId}`,
    'PATCH',
    { wa_trainee: '081299998888' }
  );
  console.log('PATCH students status:', patchRes1.status);
  console.log('PATCH response body:', JSON.stringify(patchRes1.body, null, 2));

  console.log('\n[Test] 3. GET profile to verify updated wa_trainee...');
  const profileRes2 = await get(`http://localhost:4000/dashboard/profile/${traineeId}`);
  console.log('GET profile status:', profileRes2.status);
  console.log('Updated wa_trainee:', profileRes2.body.data.wa_trainee);

  console.log('\n[Test] 4. PATCH student update endpoint with wa_trainnee (deprecated name fallback verification)...');
  const patchRes2 = await request(
    `http://localhost:4000/api/students/${traineeId}`,
    'PATCH',
    { wa_trainnee: '081277776666' }
  );
  console.log('PATCH students status:', patchRes2.status);
  console.log('PATCH response body:', JSON.stringify(patchRes2.body, null, 2));

  console.log('\n[Test] 5. GET profile to verify updated wa_trainee from fallback...');
  const profileRes3 = await get(`http://localhost:4000/dashboard/profile/${traineeId}`);
  console.log('GET profile status:', profileRes3.status);
  console.log('Updated wa_trainee (from fallback):', profileRes3.body.data.wa_trainee);

  console.log('\n[Test] 6. Restoring original wa_trainee value...');
  const restoreRes = await request(
    `http://localhost:4000/api/students/${traineeId}`,
    'PATCH',
    { wa_trainee: originalWaTrainee }
  );
  console.log('Restore PATCH status:', restoreRes.status);
  
  console.log('\n[Test] Verification Complete!');
}

test().catch(console.error);
