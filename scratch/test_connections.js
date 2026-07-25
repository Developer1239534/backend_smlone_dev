const { Client } = require('ssh2');

const credentials = [
  { host: '72.62.2.160', password: 'W@p0UxZcg7.b7D@' },
  { host: '72.62.2.160', password: '(6PQBskHxl2Ahc;.' },
  { host: '187.127.206.193', password: 'W@p0UxZcg7.b7D@' },
  { host: '187.127.206.193', password: '(6PQBskHxl2Ahc;.' }
];

function testCred(cred) {
  return new Promise((resolve) => {
    console.log(`Testing ${cred.host} with password ${cred.password.substring(0, 3)}...`);
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`✅ SUCCESS: Connected to ${cred.host} with password ${cred.password}`);
      conn.end();
      resolve(true);
    }).on('error', (err) => {
      console.log(`❌ FAILED: ${cred.host} error: ${err.message}`);
      resolve(false);
    }).connect({
      host: cred.host,
      port: 22,
      username: 'root',
      password: cred.password,
      readyTimeout: 10000
    });
  });
}

async function main() {
  for (const cred of credentials) {
    const success = await testCred(cred);
    if (success) {
      console.log('Found working credential!');
      break;
    }
  }
}

main();
