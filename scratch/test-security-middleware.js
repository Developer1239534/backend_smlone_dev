const { spawn } = require('child_process');
const http = require('http');

const PORT = 4050;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make HTTP requests
const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (body) {
      defaultHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: defaultHeaders
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('--- MENJALANKAN UJI COBA KEAMANAN MIDDLEWARE ---');
  let success = true;

  try {
    // Uji 1: Memeriksa endpoint publik login (harus sukses)
    console.log('\n[Uji 1] GET /api/auth/login (Endpoint Publik)...');
    const res1 = await request('GET', '/api/auth/login');
    console.log(`Status: ${res1.status}, Pesan: ${res1.body.message}`);
    if (res1.status !== 200) {
      console.error('❌ Uji 1 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 1 BERHASIL');
    }

    // Uji 2: Memeriksa endpoint admin tanpa token (harus 401)
    console.log('\n[Uji 2] GET /api/admin/trainees tanpa token (Harus Ditolak)...');
    const res2 = await request('GET', '/api/admin/trainees');
    console.log(`Status: ${res2.status}, Pesan: ${res2.body.message}`);
    if (res2.status !== 401) {
      console.error('❌ Uji 2 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 2 BERHASIL (Akses Ditolak dengan benar)');
    }

    // Uji 3: Memeriksa endpoint admin dengan token tidak valid (harus 401)
    console.log('\n[Uji 3] GET /api/admin/trainees dengan token tidak valid (Harus Ditolak)...');
    const res3 = await request('GET', '/api/admin/trainees', {
      'Authorization': 'Bearer token_ngawur_123'
    });
    console.log(`Status: ${res3.status}, Pesan: ${res3.body.message}`);
    if (res3.status !== 401) {
      console.error('❌ Uji 3 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 3 BERHASIL (Akses Ditolak dengan benar)');
    }

    // Uji 4: Registrasi Trainee Uji Coba (untuk mendapatkan token)
    const testId = '999888';
    const testPass = 'pass12345';
    console.log(`\n[Uji 4] POST /api/auth/register untuk ID ${testId}...`);
    const res4 = await request('POST', '/api/auth/register', {}, {
      id: testId,
      trainee_name: 'Security Test Trainee',
      password: testPass
    });
    console.log(`Status: ${res4.status}, Pesan: ${res4.body.message}`);
    if (res4.status !== 200 && res4.status !== 201 && !res4.body.message.includes('sudah pernah terdaftar')) {
      console.error('❌ Uji 4 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 4 BERHASIL');
    }

    // Uji 5: Login untuk mendapatkan token JWT
    console.log(`\n[Uji 5] POST /api/auth/login untuk ID ${testId}...`);
    const res5 = await request('POST', '/api/auth/login', {}, {
      id: testId,
      password: testPass
    });
    console.log(`Status: ${res5.status}, Pesan: ${res5.body.message}`);
    const token = res5.body.token;
    if (res5.status !== 200 || !token) {
      console.error('❌ Uji 5 GAGAL! Gagal mendapatkan token.');
      success = false;
      return;
    }
    console.log(`✅ Uji 5 BERHASIL (Token diperoleh: ${token.substring(0, 15)}...)`);

    // Uji 6: Akses /api/admin/trainees dengan token valid (harus sukses 200)
    console.log('\n[Uji 6] GET /api/admin/trainees dengan token valid (Harus Diizinkan)...');
    const res6 = await request('GET', '/api/admin/trainees', {
      'Authorization': `Bearer ${token}`
    });
    console.log(`Status: ${res6.status}, Jumlah Trainee: ${res6.body.count}`);
    if (res6.status !== 200) {
      console.error('❌ Uji 6 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 6 BERHASIL');
    }

    // Uji 7: Ubah profil sendiri dengan token valid (harus diizinkan)
    console.log(`\n[Uji 7] PATCH /api/students/${testId} (Ubah Profil Sendiri - Harus Diizinkan)...`);
    const res7 = await request('PATCH', `/api/students/${testId}`, {
      'Authorization': `Bearer ${token}`
    }, {
      wa_trainee: '08123456789'
    });
    console.log(`Status: ${res7.status}, Pesan: ${res7.body.message}`);
    if (res7.status !== 200) {
      console.error('❌ Uji 7 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 7 BERHASIL');
    }

    // Uji 8: Ubah profil orang lain dengan token valid (harus 403 Forbidden)
    const otherId = '999999';
    console.log(`\n[Uji 8] PATCH /api/students/${otherId} (Ubah Profil Orang Lain - Harus Dilarang 403)...`);
    const res8 = await request('PATCH', `/api/students/${otherId}`, {
      'Authorization': `Bearer ${token}`
    }, {
      wa_trainee: '08123456789'
    });
    console.log(`Status: ${res8.status}, Pesan: ${res8.body.message}`);
    if (res8.status !== 403) {
      console.error('❌ Uji 8 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 8 BERHASIL (Akses Dilarang dengan benar)');
    }

    // Uji 9: Hapus kembali trainee uji coba (untuk kebersihan DB & verifikasi rute DELETE)
    console.log(`\n[Uji 9] DELETE /api/admin/trainees/${testId} (Membersihkan DB - Harus Diizinkan)...`);
    const res9 = await request('DELETE', `/api/admin/trainees/${testId}`, {
      'Authorization': `Bearer ${token}`
    });
    console.log(`Status: ${res9.status}, Pesan: ${res9.body.message}`);
    if (res9.status !== 200) {
      console.error('❌ Uji 9 GAGAL!');
      success = false;
    } else {
      console.log('✅ Uji 9 BERHASIL');
    }

  } catch (err) {
    console.error('Terjadi error selama pengujian:', err);
    success = false;
  }

  if (success) {
    console.log('\n🎉 SEMUA UJI COBA KEAMANAN MIDDLEWARE BERHASIL! 🎉\n');
    process.exit(0);
  } else {
    console.log('\n❌ ADA BEBERAPA UJI COBA YANG GAGAL. PERIKSA KEMBALI KODE. ❌\n');
    process.exit(1);
  }
};

// Start the server programmatically
console.log(`Memulai server SMLONE di port ${PORT}...`);
const server = spawn('node', ['src/server.js'], {
  env: { ...process.env, PORT: PORT }
});

let started = false;
server.stdout.on('data', data => {
  const output = data.toString();
  console.log(`[Server]: ${output.trim()}`);
  if (output.includes('Server is running') && !started) {
    started = true;
    // Wait a brief moment for database migrations to complete
    setTimeout(runTests, 1500);
  }
});

server.stderr.on('data', data => {
  console.error(`[Server Error]: ${data.toString().trim()}`);
});

server.on('close', code => {
  console.log(`Server berhenti dengan kode ${code}`);
});
