const { spawn } = require('child_process');
const http = require('http');

const PORT = 4070;

const makeGetRequest = (path) => {
  return new Promise((resolve) => {
    http.get(`http://localhost:${PORT}${path}`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const run = async () => {
  console.log('\n--- VERIFIKASI PENCEGAHAN KEBOCORAN PASSWORD ---');

  // Test 1: GET /api/dashboard-trainee
  console.log('\nMengambil data semua trainee dari /api/dashboard-trainee...');
  const res1 = await makeGetRequest('/api/dashboard-trainee');
  if (res1 && res1.success && res1.data && res1.data.length > 0) {
    const sample = res1.data[0];
    console.log(`Sample Trainee ID: ${sample.id}, Nama: ${sample.trainee_name}`);
    console.log(`- Apakah field 'password' ada? ${sample.password !== undefined ? '❌ YA' : '✅ TIDAK'}`);
    console.log(`- Apakah field 'plain_password' ada? ${sample.plain_password !== undefined ? '❌ YA' : '✅ TIDAK'}`);
  } else {
    console.error('Gagal mengambil data dari /api/dashboard-trainee');
  }

  // Test 2: GET /api/dashboard-trainee/:id
  const testId = '858';
  console.log(`\nMengambil detail trainee ID ${testId} dari /api/dashboard-trainee/${testId}...`);
  const res2 = await makeGetRequest(`/api/dashboard-trainee/${testId}`);
  if (res2 && res2.success && res2.data) {
    const trainee = res2.data;
    console.log(`Trainee ID: ${trainee.id}, Nama: ${trainee.trainee_name}`);
    console.log(`- Apakah field 'password' ada? ${trainee.password !== undefined ? '❌ YA' : '✅ TIDAK'}`);
    console.log(`- Apakah field 'plain_password' ada? ${trainee.plain_password !== undefined ? '❌ YA' : '✅ TIDAK'}`);
  } else {
    console.error(`Gagal mengambil data dari /api/dashboard-trainee/${testId}`);
  }

  console.log('\n--- VERIFIKASI SELESAI ---');
  process.exit(0);
};

// Start server programmatically on port 4070
const server = spawn('node', ['src/server.js'], {
  env: { ...process.env, PORT: PORT }
});

server.stdout.on('data', data => {
  if (data.toString().includes('Server is running')) {
    setTimeout(run, 1500);
  }
});
