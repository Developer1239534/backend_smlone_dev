const { pool } = require('../src/db/neonClient');

async function main() {
  const baseUrl = 'https://raw.githubusercontent.com/Developer1239534/backend_smlone_dev/main/src/public/images/news';
  const updates = [
    { title: 'Open New Class Baca Tulis', url: `${baseUrl}/baca-tulis.jpg` },
    { title: 'Public Speaking Untuk Pemula', url: `${baseUrl}/public-speaking.png` }
  ];

  try {
    for (const item of updates) {
      await pool.query(
        'UPDATE news_announcements SET image_url = $1 WHERE title = $2',
        [item.url, item.title]
      );
      console.log(`Updated image for: ${item.title} -> ${item.url}`);
    }
    console.log('✅ All images updated with GitHub Raw URLs successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
