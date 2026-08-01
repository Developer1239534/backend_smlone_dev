const fs = require('fs');
const path = require('path');

const routesDir = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\src\\routes';

const files = fs.readdirSync(routesDir);
const report = [];

files.forEach(file => {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
    const selectAllMatches = (content.match(/SELECT\s+\*\s+FROM/gi) || []).length;
    const queryMatches = (content.match(/\.query\(/g) || []).length;
    if (selectAllMatches > 0 || queryMatches > 0) {
      report.push({ file, queryCount: queryMatches, selectAllCount: selectAllMatches });
    }
  }
});

console.table(report);
fs.writeFileSync('C:\\Users\\ASUS ROG\\.gemini\\antigravity\\scratch\\backend_smlone_dev\\query_audit.json', JSON.stringify(report, null, 2));
