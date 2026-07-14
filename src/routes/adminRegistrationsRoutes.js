const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

router.get('/', async (req, res) => {
  try {
    // Memanggil URL Webhook Production dari n8n (tanpa "-test")
    const webhookUrl = 'https://n8n-jua7.srv1825659.hstgr.cloud/webhook/881474cc-cb02-4869-8bbe-d012aaf17ba0';
    
    // Melakukan request ke n8n
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Cek apakah response dari n8n berhasil
    if (!response.ok) {
      throw new Error(`Gagal mengambil data dari n8n (Status: ${response.status}). Pastikan workflow n8n sudah 'Active'.`);
    }

    const data = await response.json();
    
    // Memasukkan data ke dalam database
    if (Array.isArray(data) && data.length > 0) {
      // Begin Transaction
      await db.query('BEGIN');
      
      for (const row of data) {
        // Ambil nilai dari setiap kolom (sesuaikan dengan nama kolom di Google Sheets)
        const timestamp_str = row['Timestamp'] || '';
        const email = row['Email Address'] || '';
        const full_name = row['Full Name'] || '';
        
        // Skip jika email atau full_name kosong untuk menghindari error UNIQUE
        if (!email || !full_name) continue;

        const dob = row['Date of Birth'] || '';
        const gender = row['Gender'] || '';
        const address = row['Address'] || '';
        const phone = row['Contact / Whatsapp No.'] || '';
        const program = row['Program'] || '';
        const registration_date = row['Today\'s Date'] || '';
        const selected_program = row['Program Yang Dipilih'] || '';
        const school = row['Nama Sekolah (Peserta Training)'] || '';
        const parent_email = row['Parent\'s Email'] || '';
        const emergency_contact_name = row['Emergency Contact Person'] || '';
        const emergency_contact_phone = row['Emergency Contact Number'] || '';
        const grade = row['Kelas (Peserta Training)'] || '';
        const source = row['Dari Manakah Anda Mengetahui SMLONE?'] || '';
        const ig_mom = row['Akun Instagram Mama'] || '';
        const ig_dad = row['Akun Instagram Papa'] || '';
        const ig_child = row['Akun Instagram Anak'] || '';
        const raw_data = JSON.stringify(row);

        const upsertQuery = `
          INSERT INTO level_1_ca_registrations (
            timestamp_str, email, full_name, dob, gender, address, phone, program, 
            registration_date, selected_program, school, parent_email, emergency_contact_name, 
            emergency_contact_phone, grade, source, ig_mom, ig_dad, ig_child, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
          )
          ON CONFLICT (email, full_name) 
          DO UPDATE SET
            timestamp_str = EXCLUDED.timestamp_str,
            dob = EXCLUDED.dob,
            gender = EXCLUDED.gender,
            address = EXCLUDED.address,
            phone = EXCLUDED.phone,
            program = EXCLUDED.program,
            registration_date = EXCLUDED.registration_date,
            selected_program = EXCLUDED.selected_program,
            school = EXCLUDED.school,
            parent_email = EXCLUDED.parent_email,
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_phone = EXCLUDED.emergency_contact_phone,
            grade = EXCLUDED.grade,
            source = EXCLUDED.source,
            ig_mom = EXCLUDED.ig_mom,
            ig_dad = EXCLUDED.ig_dad,
            ig_child = EXCLUDED.ig_child,
            raw_data = EXCLUDED.raw_data;
        `;
        
        await db.query(upsertQuery, [
          timestamp_str, email, full_name, dob, gender, address, phone, program, 
          registration_date, selected_program, school, parent_email, emergency_contact_name, 
          emergency_contact_phone, grade, source, ig_mom, ig_dad, ig_child, raw_data
        ]);
      }
      
      await db.query('COMMIT');
    }
    
    // Ambil data yang sudah tersimpan untuk dikirim ke frontend
    const savedData = await db.query('SELECT * FROM level_1_ca_registrations ORDER BY created_at DESC');

    res.json({
      success: true,
      message: `Berhasil sinkronisasi ${data.length} data pendaftar dari n8n ke database Level 1 CA.`,
      data: savedData.rows
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error fetching/syncing registrations from n8n:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal melakukan sinkronisasi data pendaftaran.',
      error: error.message 
    });
  }
});

// POST endpoint untuk menerima data langsung dari n8n (Push Method)
router.post('/push', async (req, res) => {
  try {
    let data = req.body;
    
    // n8n mungkin mengirimkan 1 object (per item) atau array. Kita pastikan formatnya array.
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kosong.' });
    }

    await db.query('BEGIN');
    
    let insertedCount = 0;
    
    for (const row of data) {
      const timestamp_str = row['Timestamp'] || '';
      const email = row['Email Address'] || '';
      const full_name = row['Full Name'] || '';
      
      // Skip jika email atau full_name kosong
      if (!email || !full_name) continue;

      const dob = row['Date of Birth'] || '';
      const gender = row['Gender'] || '';
      const address = row['Address'] || '';
      const phone = row['Contact / Whatsapp No.'] || '';
      const program = row['Program'] || '';
      const registration_date = row['Today\'s Date'] || '';
      const selected_program = row['Program Yang Dipilih'] || '';
      const school = row['Nama Sekolah (Peserta Training)'] || '';
      const parent_email = row['Parent\'s Email'] || '';
      const emergency_contact_name = row['Emergency Contact Person'] || '';
      const emergency_contact_phone = row['Emergency Contact Number'] || '';
      const grade = row['Kelas (Peserta Training)'] || '';
      const source = row['Dari Manakah Anda Mengetahui SMLONE?'] || '';
      const ig_mom = row['Akun Instagram Mama'] || '';
      const ig_dad = row['Akun Instagram Papa'] || '';
      const ig_child = row['Akun Instagram Anak'] || '';
      const raw_data = JSON.stringify(row);

      const upsertQuery = `
        INSERT INTO level_1_ca_registrations (
          timestamp_str, email, full_name, dob, gender, address, phone, program, 
          registration_date, selected_program, school, parent_email, emergency_contact_name, 
          emergency_contact_phone, grade, source, ig_mom, ig_dad, ig_child, raw_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        ON CONFLICT (email, full_name) 
        DO UPDATE SET
          timestamp_str = EXCLUDED.timestamp_str,
          dob = EXCLUDED.dob,
          gender = EXCLUDED.gender,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          program = EXCLUDED.program,
          registration_date = EXCLUDED.registration_date,
          selected_program = EXCLUDED.selected_program,
          school = EXCLUDED.school,
          parent_email = EXCLUDED.parent_email,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          emergency_contact_phone = EXCLUDED.emergency_contact_phone,
          grade = EXCLUDED.grade,
          source = EXCLUDED.source,
          ig_mom = EXCLUDED.ig_mom,
          ig_dad = EXCLUDED.ig_dad,
          ig_child = EXCLUDED.ig_child,
          raw_data = EXCLUDED.raw_data;
      `;
      
      await db.query(upsertQuery, [
        timestamp_str, email, full_name, dob, gender, address, phone, program, 
        registration_date, selected_program, school, parent_email, emergency_contact_name, 
        emergency_contact_phone, grade, source, ig_mom, ig_dad, ig_child, raw_data
      ]);
      insertedCount++;
    }
    
    await db.query('COMMIT');

    res.json({
      success: true,
      message: `Berhasil menerima dan menyimpan ${insertedCount} data dari n8n.`
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error receiving push from n8n:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses data kiriman n8n.',
      error: error.message 
    });
  }
});

module.exports = router;
