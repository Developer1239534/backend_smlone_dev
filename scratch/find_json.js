const fs = require('fs');
const path = require('path');

function findJsonFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name === 'node_modules' || item.name === '.git') continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      findJsonFiles(fullPath);
    } else if (item.isFile() && item.name.endsWith('.json')) {
      console.log(`JSON File: ${fullPath} (${fs.statSync(fullPath).size} bytes)`);
    }
  }
}

findJsonFiles(path.join(__dirname, '..'));
