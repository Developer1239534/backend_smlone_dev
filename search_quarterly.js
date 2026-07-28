const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') searchDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('quarterly_report_url')) {
        console.log('Found in:', fullPath);
      }
    }
  }
}

searchDir(__dirname);
