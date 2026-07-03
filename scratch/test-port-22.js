const net = require('net');

const client = net.connect({ host: '72.62.2.160', port: 22 }, () => {
  console.log('CONNECTED to port 22 successfully!');
  client.end();
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.setTimeout(5000, () => {
  console.log('Connection timed out after 5 seconds.');
  client.destroy();
});
