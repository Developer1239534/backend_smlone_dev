const https = require('https');

const url = 'https://drive.google.com/file/d/1BdM5kdOXOjwhZyvsES6Khuc4Q_W8LZLs/view';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const titleMatch = data.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      console.log('Title:', titleMatch[1]);
    } else {
      console.log('No title found.');
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
