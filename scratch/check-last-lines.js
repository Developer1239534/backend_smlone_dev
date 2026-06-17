const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'full-user-prompt-2025-may-dec.txt');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Total lines extracted:', lines.length);
console.log('Last 20 lines:');
lines.slice(-20).forEach((line, index) => {
  console.log(`${lines.length - 20 + index + 1}: ${line}`);
});
