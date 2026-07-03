const { spawn } = require('child_process');
const http = require('http');

const PORT = 4055;

// Helper to make HTTP request and print headers/status
const makeRequest = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: d
        });
      });
    });
    req.on('error', () => resolve({ status: 500, body: 'Server Error' }));
    req.write(JSON.stringify({ id: 'dummy', password: 'dummy' }));
    req.end();
  });
};

const runVerification = async () => {
  console.log('\n--- MULAI VERIFIKASI RATE LIMITING ---');
  
  // 1. Kirim request pertama untuk mengecek HTTP headers rate limiting
  console.log('\nMengirim request ke-1...');
  const res1 = await makeRequest();
  console.log(`Status Kode: ${res1.status}`);
  console.log('HTTP Headers Rate Limiting yang diterima:');
  console.log(`- ratelimit-limit: ${res1.headers['ratelimit-limit']}`);
  console.log(`- ratelimit-remaining: ${res1.headers['ratelimit-remaining']}`);
  console.log(`- ratelimit-reset: ${res1.headers['ratelimit-reset']}`);

  // 2. Lakukan spamming sebanyak 22 request untuk memicu batas limit (batas login adalah 20)
  console.log('\nMelakukan spamming 21 request ke endpoint login...');
  let lastRes = null;
  for (let i = 2; i <= 22; i++) {
    lastRes = await makeRequest();
    if (lastRes.status === 429) {
      console.log(`\n🚨 BERHASIL MEMICU RATE LIMIT pada request ke-${i}!`);
      console.log(`Status Kode: ${lastRes.status} (Too Many Requests)`);
      console.log(`Respon Server: ${lastRes.body}`);
      break;
    }
  }

  if (lastRes && lastRes.status !== 429) {
    console.log('❌ Gagal memicu rate limiting. Batas limit tidak bekerja.');
  }
  
  console.log('\n--- VERIFIKASI SELESAI ---');
  process.exit(0);
};

// Start server on port 4055 for verification
const server = spawn('node', ['src/server.js'], {
  env: { ...process.env, PORT: PORT }
});

server.stdout.on('data', data => {
  const output = data.toString();
  if (output.includes('Server is running')) {
    setTimeout(runVerification, 1500);
  }
});
