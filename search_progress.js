const fs = require('fs');
const path = require('path');

function search() {
  const routesDir = path.join(__dirname, 'src', 'routes');
  const files = fs.readdirSync(routesDir);
  for (const file of files) {
    const fullPath = path.join(routesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.toLowerCase().includes('progress_') || content.toLowerCase().includes('speaking_project_to_next_level')) {
      console.log(`File matches: ${file}`);
    }
  }
}

search();
