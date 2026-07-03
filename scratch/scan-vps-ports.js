const net = require('net');

const host = '72.62.2.160';
const ports = [22, 80, 443, 2222, 3389, 8080, 4000];

function checkPort(port) {
  return new Promise((resolve) => {
    const conn = net.connect(port, host, () => {
      console.log(`Port ${port} is OPEN`);
      conn.destroy();
      resolve(true);
    });
    
    conn.setTimeout(3000);
    conn.on('timeout', () => {
      conn.destroy();
      resolve(false);
    });
    
    conn.on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  console.log(`Scanning common ports for ${host}...`);
  for (const port of ports) {
    await checkPort(port);
  }
  console.log('Scan completed.');
}

main();
