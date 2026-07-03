const { pool } = require('../src/db/neonClient');

async function main() {
  const updates = [
    { title: 'REAL STAGE: How to Join', url: 'https://api.smlone.com/public/images/news/real-stage.jpg' },
    { title: 'Parents Trainer Meeting', url: 'https://api.smlone.com/public/images/news/ptm.png' },
    { title: 'Jumat Produktif Bersama SMLONE', url: 'https://api.smlone.com/public/images/news/jumat-produktif.jpg' },
    { title: 'Future Leaders Camp 2026', url: 'https://api.smlone.com/public/images/news/flc.png' },
    { title: 'Lantern & Legends Holiday Camp', url: 'https://api.smlone.com/public/images/news/lantern.png' }
  ];

  try {
    for (const item of updates) {
      await pool.query(
        'UPDATE news_announcements SET image_url = $1 WHERE title = $2',
        [item.url, item.title]
      );
      console.log(`Updated image for: ${item.title}`);
    }
    console.log('✅ All images linked successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
