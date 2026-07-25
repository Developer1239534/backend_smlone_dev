const fs = require('fs');
const path = require('path');

function searchInDir(dir, pattern) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name === 'node_modules' || item.name === '.git') continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      searchInDir(fullPath, pattern);
    } else if (item.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (pattern.test(content)) {
        console.log(`Found match in: ${fullPath}`);
      }
    }
  }
}

searchInDir(path.join(__dirname, '..'), /dashboard_trainne/i);
searchInDir(path.join(__dirname, '..'), /CREATE TABLE/i);
