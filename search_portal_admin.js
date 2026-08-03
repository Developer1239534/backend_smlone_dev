const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.json') || entry.name.endsWith('.sql'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('portal_admin')) {
        console.log('Found in:', fullPath);
      }
    }
  }
}

searchDir('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch');
