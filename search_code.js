const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const results = [];
  function walk(currentDir) {
    if (currentDir.includes('node_modules') || currentDir.includes('.git')) return;
    const files = fs.readdirSync(currentDir);
    for (const f of files) {
      const fullPath = path.join(currentDir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx') || f.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(pattern)) {
          results.push(fullPath);
        }
      }
    }
  }
  walk(dir);
  return results;
}

console.log('Search in backend_smlone_dev:');
console.log(searchDir('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev', 'portal_trainee'));

console.log('Search in smlone_portal:');
console.log(searchDir('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\smlone_portal', 'portal_trainee'));
