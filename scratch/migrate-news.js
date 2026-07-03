const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    console.log('🔄 Creating news_announcements table...');
    // Create news_announcements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_announcements (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        date_string VARCHAR(50),
        time_string VARCHAR(50),
        description TEXT,
        contacts TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed data for news_announcements
    const newsCheck = await pool.query('SELECT COUNT(*) FROM news_announcements');
    if (parseInt(newsCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding news_announcements table...');
      await pool.query(`
        INSERT INTO news_announcements (category, title, date_string, time_string, description, contacts, image_url) VALUES
        ('Umum', 'REAL STAGE: How to Join', '23 Jun 2026', '11:55', 'Trainee dapat mempersiapkan diri dan melakukan pendaftaran setelah menyelesaikan seluruh Speaking & Life Projects serta mempelajari panduan Real Stage yang telah disediakan.', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815', NULL),
        ('Umum', 'Parents Trainer Meeting', '23 Jun 2026', '10:41', 'Papa Mama dapat mendaftar sebelum 5 Juli 2026 melalui link pendaftaran https://smlone.xyz/ptm untuk mengikuti konsultasi one-on-one mengenai perkembangan anak dengan trainer di SMLONE Cabang Cemara Asri (https://g.co/kgs/VZxUctT).', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815\nHubungi Aurel 0851-6355-9331', NULL),
        ('Umum', 'Jumat Produktif Bersama SMLONE', '20 Jun 2026', '09:00', 'Tingkatkan diri Anda bersama SMLONE. Rangkaian program workshop interaktif mingguan untuk pembentukan karakter, kemampuan leadership, teknik presentasi sales, serta peningkatan produktivitas yang dibimbing langsung oleh trainer berpengalaman puluhan tahun di bidangnya.', 'Hubungi Jovita 0811-6785-818', NULL),
        ('Umum', 'Future Leaders Camp 2026', '30 Jun 2026', '10:00', 'Summer camp program pembentukan karakter & kepercayaan diri anak usia sekolah. Tersedia kategori: Apprentice (1-3 SD), Junior (4-6 SD), dan Youth (SMP-SMA).', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815\nHubungi Aurel 0851-6355-9331', NULL),
        ('Umum', 'Lantern & Legends Holiday Camp', '11 Jun 2026', '08:30', 'Belajar budaya & bahasa Mandarin secara interaktif selama 2 hari penuh (Full Mandarin Speaking Experience). Terbuka untuk Explorers (Grade 2-6) dan Legends (Grade 7-12).', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815\nHubungi Aurel 0851-6355-9331', NULL),
        ('Umum', 'Open New Class Baca Tulis', '18 Jun 2026', '11:00', 'Kelas membaca dan menulis baru untuk si kecil. Dapatkan promo spesial harga khusus untuk 3 pendaftar pertama beserta free student pack lengkap (tas, kaos, map, progress report, trial sheet).', 'Hubungi Sophia 0811-620-5815', NULL),
        ('Umum', 'Public Speaking Untuk Pemula', '26 Jul 2026', '13:44', 'Pelatihan public speaking intensif dengan praktek langsung, e-sertifikat, dokumentasi video, training handout, makan siang & coffee break. Khusus usia 18 tahun ke atas.', 'Hubungi Jovita 0811-6785-818', NULL)
      `);
      console.log('🌱 Seeding news_announcements completed!');
    } else {
        console.log('Data already seeded.');
    }
    
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
