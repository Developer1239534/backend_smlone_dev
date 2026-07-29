const fs = require('fs');
const path = require('path');

function searchAllFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchAllFiles(fullPath);
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes('progress_') || line.toLowerCase().includes('progress') || line.toLowerCase().includes('speaking_project_to_next_level')) {
          console.log(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

searchAllFiles(path.join(__dirname, 'src'));
process.exit(0);
