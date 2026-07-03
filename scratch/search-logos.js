const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\ASUS ROG\\Documents\\BE\\backend_smlone_dev\\scratch\\full-request.txt';

async function main() {
  if (!fs.existsSync(logFilePath)) {
    console.log('No full-request.txt found.');
    return;
  }
  const content = fs.readFileSync(logFilePath, 'utf8');
  const lines = content.split('\n');
  console.log('Searching for logos or cloudinary in logs...');
  for (const line of lines) {
    if (line.includes('logo') || line.includes('image') || line.includes('cloudinary')) {
      console.log('-', line.trim());
    }
  }
}

main();
