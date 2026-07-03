const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'latest-user-request-real-stages.txt');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (line.includes('1-STIgf')) {
    console.log('Line content:', line);
    // Find the URL part
    const url = line.split('\t')[2].trim();
    console.log('URL:', url);
    for (let i = 0; i < url.length; i++) {
      console.log(`Char ${i}: '${url[i]}' (code: ${url.charCodeAt(i)})`);
    }
  }
}
