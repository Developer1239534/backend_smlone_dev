const fs = require('fs');
const path = require('path');

function findColumns() {
  const routesDir = path.join(__dirname, '../src/routes');
  const files = fs.readdirSync(routesDir);

  files.forEach(file => {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
    if (content.includes('dashboard_trainne')) {
      console.log(`=== ${file} ===`);
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('dashboard_trainne') || line.includes('dt.')) {
          console.log(`Line ${i+1}: ${line.trim()}`);
        }
      });
    }
  });
}

findColumns();
