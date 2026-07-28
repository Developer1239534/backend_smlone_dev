const http = require('http');

async function testHealth() {
  console.log('Testing server syntax & load...');
  try {
    require('./src/server');
    console.log('✅ Server loaded successfully without errors!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Server load error:', err);
    process.exit(1);
  }
}

testHealth();
