const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, pattern);
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (pattern.test(content)) {
        console.log('Match found in:', fullPath);
      }
    }
  }
}

console.log('--- Searching for rateLimit / limiter / 429 ---');
searchDir('C:/Users/ASUS ROG/.gemini/antigravity/scratch/backend_smlone_dev', /rate|limit|429/i);
