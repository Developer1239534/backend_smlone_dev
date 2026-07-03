const fs = require('fs');
const path = require('path');

function main() {
  const filePath = path.join(__dirname, 'full-request.txt');
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`full-request.txt exists! Size: ${stats.size} bytes`);
    
    // Read first 10 lines
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    console.log('First 20 lines:');
    console.log(lines.slice(0, 20).join('\n'));
    
    console.log('\nLast 20 lines:');
    console.log(lines.slice(-20).join('\n'));
  } else {
    console.log('full-request.txt does NOT exist!');
  }
}

main();
