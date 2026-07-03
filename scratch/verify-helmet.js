const { spawn } = require('child_process');
const http = require('http');

const PORT = 4060;

const checkHeaders = () => {
  return new Promise((resolve) => {
    http.get(`http://localhost:${PORT}/api/health`, res => {
      resolve(res.headers);
    }).on('error', () => resolve(null));
  });
};

const run = async () => {
  console.log('\n--- VERIFIKASI KEAMANAN HTTP HEADERS (HELMET) ---');
  
  const headers = await checkHeaders();
  if (!headers) {
    console.error('Gagal mengambil data header dari server.');
    process.exit(1);
  }

  console.log('\n1. Memeriksa apakah identitas Express disembunyikan:');
  if (headers['x-powered-by']) {
    console.log(`❌ GAGAL: Header 'x-powered-by' masih ada: ${headers['x-powered-by']}`);
  } else {
    console.log(`✅ BERHASIL: Header 'x-powered-by' tidak ditemukan (Identitas Express disembunyikan!).`);
  }

  console.log('\n2. Memeriksa HTTP Security Headers yang ditambahkan oleh Helmet:');
  
  const securityHeaders = [
    'x-content-type-options',
    'x-dns-prefetch-control',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy',
    'content-security-policy'
  ];

  securityHeaders.forEach(header => {
    if (headers[header]) {
      console.log(`✅ ADA: '${header}' -> Value: "${headers[header]}"`);
    } else {
      console.log(`⚠️ TIDAK ADA: '${header}'`);
    }
  });

  console.log('\n--- VERIFIKASI HELMET SELESAI ---');
  process.exit(0);
};

// Start server programmatically on port 4060
const server = spawn('node', ['src/server.js'], {
  env: { ...process.env, PORT: PORT }
});

server.stdout.on('data', data => {
  if (data.toString().includes('Server is running')) {
    setTimeout(run, 1500);
  }
});
