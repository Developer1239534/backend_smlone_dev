const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\user_full_text.txt', 'utf8');

console.log('Last 500 chars of raw prompt:');
console.log(raw.slice(-500));
