const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');
const files = fs.readdirSync(routesDir);

files.forEach(file => {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const matches = content.match(/(FROM|JOIN|INTO|UPDATE|TABLE)\s+([a-zA-Z0-9_]+)/gi);
  if (matches) {
    console.log(`=== ${file} ===`);
    const tables = [...new Set(matches.map(m => m.split(/\s+/)[1]))];
    console.log(tables.join(', '));
  }
});
