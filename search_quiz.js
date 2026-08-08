const fs = require('fs');
const path = require('path');
const db = require('./src/db/neonClient');

async function run() {
  console.log('Searching for any quiz routes or files...');
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes('quiz')) {
          console.log(`Found "quiz" in file: ${fullPath}`);
        }
      }
    }
  }

  walkDir(__dirname + '/src');

  // Also check all table column names in PostgreSQL schema to see if any column mentions quiz
  const colRes = await db.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND LOWER(column_name) LIKE '%quiz%'
  `);
  console.log('Columns matching "quiz":', colRes.rows);

  process.exit(0);
}

run();
