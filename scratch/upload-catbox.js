const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/neonClient');

async function uploadToCatbox(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', new Blob([fileBuffer]), path.basename(filePath));

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload ${filePath}: ${response.statusText}`);
  }
  
  return await response.text();
}

async function main() {
  const images = [
    { title: 'REAL STAGE: How to Join', file: 'real-stage.jpg' },
    { title: 'Parents Trainer Meeting', file: 'ptm.png' },
    { title: 'Jumat Produktif Bersama SMLONE', file: 'jumat-produktif.jpg' },
    { title: 'Future Leaders Camp 2026', file: 'flc.png' },
    { title: 'Lantern & Legends Holiday Camp', file: 'lantern.png' }
  ];

  try {
    for (const item of images) {
      const filePath = path.join(__dirname, '../src/public/images/news', item.file);
      console.log(`Uploading ${item.file}...`);
      const url = await uploadToCatbox(filePath);
      console.log(`Success! URL: ${url}`);
      
      await pool.query(
        'UPDATE news_announcements SET image_url = $1 WHERE title = $2',
        [url, item.title]
      );
      console.log(`Updated DB for: ${item.title}`);
    }
    console.log('✅ All images uploaded and linked successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
