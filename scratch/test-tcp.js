const net = require('net');

function checkPort(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      console.log(`Port ${port} is OPEN`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`Port ${port} connection TIMEOUT`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`Port ${port} connection ERROR: ${err.message}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  const host = '72.62.2.160';
  console.log(`Checking ports on ${host}...`);
  await checkPort(22, host);
  await checkPort(80, host);
  await checkPort(443, host);
}

main();
