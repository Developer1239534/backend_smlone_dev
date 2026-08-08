const fs = require('fs');
const content = fs.readFileSync(__dirname + '/src/routes/dashboardApiRoutes.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('portal_trainee')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
process.exit(0);
