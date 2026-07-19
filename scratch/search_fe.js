const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // Skip system/heavy folders
          if (file !== 'node_modules' && file !== '.git' && file !== 'AppData' && file !== 'Microsoft' && !file.startsWith('.')) {
            searchFiles(fullPath);
          }
        } else {
          if (file === 'App.jsx' || file === 'App.tsx') {
            // Read content to see if it makes a fetch request
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('webhook/level-1-keseluruhan')) {
              console.log(`FOUND TARGET FILE: ${fullPath}`);
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

console.log('Searching user directory for App.jsx/App.tsx making webhook calls...');
searchFiles('C:\\Users\\ASUS ROG');
