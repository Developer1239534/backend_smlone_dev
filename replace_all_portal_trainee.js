const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('portal_trainee') || content.includes('portal_admin')) {
        console.log(`Replacing in: ${fullPath}`);
        content = content.replace(/portal_trainee/g, 'profile_trainee');
        content = content.replace(/portal_admin/g, 'profile_trainee');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('✅ Finished replacing all `portal_trainee` and `portal_admin` references in `src/` with `profile_trainee`!');
