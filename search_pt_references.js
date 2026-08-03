const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(fullPath, pattern, results);
    } else if (/\.(js|ts|jsx|tsx|sql|json|md)$/i.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(pattern)) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

const scratchPath = path.join(__dirname, '..');
const matches = searchDir(scratchPath, 'portal_trainee');
console.log('Files referencing portal_trainee:');
matches.forEach(m => console.log(' -', path.relative(scratchPath, m)));
