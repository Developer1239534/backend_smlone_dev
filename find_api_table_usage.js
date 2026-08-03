const fs = require('fs');
const path = require('path');

function searchInFiles(dir, text) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    if (f.name === 'node_modules' || f.name === '.git' || f.name === 'dist') continue;
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchInFiles(full, text);
    } else if (/\.(js|ts|jsx|tsx|html|json)$/i.test(f.name)) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(text)) {
        console.log(`Found "${text}" in: ${full}`);
      }
    }
  }
}

console.log('=== Searching API / Table references in smlone_portal ===');
searchInFiles(path.join(__dirname, '../smlone_portal'), 'portal_trainee');
searchInFiles(path.join(__dirname, '../smlone_portal'), '/api/');

console.log('=== Searching routes in backend_smlone_dev ===');
searchInFiles(path.join(__dirname, 'src/routes'), 'SELECT');
