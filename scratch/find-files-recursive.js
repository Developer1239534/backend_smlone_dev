const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    // Skip node_modules and .git
    if (file === 'node_modules' || file === '.git' || file === '.npm-cache') return;
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (file.toLowerCase().includes('gp') || file.toLowerCase().includes('tahunan') || file.toLowerCase().includes('gold')) {
        results.push({
          path: filePath,
          size: stat.size,
          mtime: stat.mtime
        });
      }
    }
  });
  return results;
}

try {
  const rootDir = path.join(__dirname, '..');
  console.log(`Searching recursively in: ${rootDir}...`);
  const found = walk(rootDir);
  console.log(`Found ${found.length} files matching search terms:`);
  console.table(found);
} catch (err) {
  console.error('Error:', err.message);
}
