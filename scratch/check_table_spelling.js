const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');
const files = fs.readdirSync(routesDir);

files.forEach(file => {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const countTrainne = (content.match(/dashboard_trainne/g) || []).length;
  const countTrainee = (content.match(/dashboard_trainee/g) || []).length;
  if (countTrainne > 0 || countTrainee > 0) {
    console.log(`${file}: dashboard_trainne=${countTrainne}, dashboard_trainee=${countTrainee}`);
  }
});
