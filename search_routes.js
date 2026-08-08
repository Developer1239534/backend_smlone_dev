const fs = require('fs');
const path = require('path');

function searchRoutes() {
  const routesDir = path.join(__dirname, 'src', 'routes');
  if (!fs.existsSync(routesDir)) {
    console.log('src/routes does not exist');
    return;
  }
  const files = fs.readdirSync(routesDir);
  for (const file of files) {
    const filePath = path.join(routesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('portal_trainee') || content.includes('progress') || content.includes('level')) {
      console.log(`Matching file: ${file}`);
    }
  }
}

searchRoutes();
