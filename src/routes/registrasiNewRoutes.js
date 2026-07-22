const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Ambil semua data dari registrasi_new_seluruh_cabang
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM registrasi_new_seluruh_cabang ORDER BY created_at DESC');
    
    // Map data agar kompatibel dengan React frontend
    const mapped = savedData.rows.map(row => {
      const data = row.data_registrasi || {};
      return {
        id: row.id,
        email_address: data['Email Address'] || data['email_address'] || data['Email'] || data['email'] || '',
        full_name: data['Full Name'] || data['full_name'] || data['Name'] || data['name'] || '',
        dob: data['Date of Birth'] || data['dob'] || '',
        gender: data['Gender'] || data['gender'] || '',
        address: data['Address'] || data['address'] || '',
        contact_whatsapp: data['Contact / Whatsapp No.'] || data['contact_whatsapp'] || data['phone'] || '',
        program: data['Program'] || data['program'] || '',
        pernah_ikut_program: data['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || data['pernah_ikut_program'] || '',
        program_pernah_diikuti: data['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || data['program_pernah_diikuti'] || '',
        todays_date: data['Today\'s Date'] || data['todays_date'] || '',
        i_agree_doc: data['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || data['i_agree_doc'] || '',
        program_dipilih: data['Program Yang Dipilih'] || data['program_dipilih'] || '',
        nama_sekolah: data['Nama Sekolah (Peserta Training)'] || data['nama_sekolah'] || '',
        kelas_peserta: data['Kelas (Peserta Training)'] || data['kelas_peserta'] || '',
        parents_email: data['Parent\'s Email'] || data['parents_email'] || '',
        emergency_contact_person: data['Emergency Contact Person'] || data['emergency_contact_person'] || '',
        emergency_contact_number: data['Emergency Contact Number'] || data['emergency_contact_number'] || '',
        tahu_smlone_dari: data['Dari Manakah Anda Mengetahui SMLONE?'] || data['tahu_smlone_dari'] || '',
        referensi_teman: data['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || data['referensi_teman'] || '',
        ig_mama: data['Akun Instagram Mama'] || data['ig_mama'] || '',
        ig_papa: data['Akun Instagram Papa'] || data['ig_papa'] || '',
        ig_anak: data['Akun Instagram Anak'] || data['ig_anak'] || '',
        cabang: row.cabang || data['cabang'] || data['Cabang'] || '',
        timestamp_str: data['Timestamp'] || data['timestamp_str'] || '',
        raw_data: data,
        created_at: row.created_at
      };
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil data dari registrasi_new_seluruh_cabang.',
      data: mapped
    });
  } catch (error) {
    console.error('Error fetching registrasi_new_seluruh_cabang:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// GET endpoint: Ambil satu data berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM registrasi_new_seluruh_cabang WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    
    const row = result.rows[0];
    const data = row.data_registrasi || {};
    const mapped = {
      id: row.id,
      email_address: data['Email Address'] || data['email_address'] || data['Email'] || data['email'] || '',
      full_name: data['Full Name'] || data['full_name'] || data['Name'] || data['name'] || '',
      dob: data['Date of Birth'] || data['dob'] || '',
      gender: data['Gender'] || data['gender'] || '',
      address: data['Address'] || data['address'] || '',
      contact_whatsapp: data['Contact / Whatsapp No.'] || data['contact_whatsapp'] || data['phone'] || '',
      program: data['Program'] || data['program'] || '',
      pernah_ikut_program: data['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || data['pernah_ikut_program'] || '',
      program_pernah_diikuti: data['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || data['program_pernah_diikuti'] || '',
      todays_date: data['Today\'s Date'] || data['todays_date'] || '',
      i_agree_doc: data['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || data['i_agree_doc'] || '',
      program_dipilih: data['Program Yang Dipilih'] || data['program_dipilih'] || '',
      nama_sekolah: data['Nama Sekolah (Peserta Training)'] || data['nama_sekolah'] || '',
      kelas_peserta: data['Kelas (Peserta Training)'] || data['kelas_peserta'] || '',
      parents_email: data['Parent\'s Email'] || data['parents_email'] || '',
      emergency_contact_person: data['Emergency Contact Person'] || data['emergency_contact_person'] || '',
      emergency_contact_number: data['Emergency Contact Number'] || data['emergency_contact_number'] || '',
      tahu_smlone_dari: data['Dari Manakah Anda Mengetahui SMLONE?'] || data['tahu_smlone_dari'] || '',
      referensi_teman: data['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || data['referensi_teman'] || '',
      ig_mama: data['Akun Instagram Mama'] || data['ig_mama'] || '',
      ig_papa: data['Akun Instagram Papa'] || data['ig_papa'] || '',
      ig_anak: data['Akun Instagram Anak'] || data['ig_anak'] || '',
      cabang: row.cabang || data['cabang'] || data['Cabang'] || '',
      timestamp_str: data['Timestamp'] || data['timestamp_str'] || '',
      raw_data: data,
      created_at: row.created_at
    };

    res.json({
      success: true,
      data: mapped
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data.',
      error: error.message 
    });
  }
});

// PUT endpoint: Admin Edit Data
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    const checkRes = await db.query('SELECT * FROM registrasi_new_seluruh_cabang WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const row = checkRes.rows[0];
    const data_registrasi = row.data_registrasi || {};
    let newCabang = row.cabang;

    // Update keys in data_registrasi
    Object.keys(updates).forEach(key => {
      if (key === 'cabang') {
        newCabang = updates[key];
        data_registrasi['cabang'] = updates[key];
        data_registrasi['Cabang'] = updates[key];
      } else if (key === 'email_address') {
        data_registrasi['Email Address'] = updates[key];
        data_registrasi['email_address'] = updates[key];
      } else if (key === 'full_name') {
        data_registrasi['Full Name'] = updates[key];
        data_registrasi['full_name'] = updates[key];
      } else if (key === 'contact_whatsapp') {
        data_registrasi['Contact / Whatsapp No.'] = updates[key];
        data_registrasi['contact_whatsapp'] = updates[key];
      } else if (key === 'parents_email') {
        data_registrasi['Parent\'s Email'] = updates[key];
        data_registrasi['parents_email'] = updates[key];
      } else if (key === 'emergency_contact_person') {
        data_registrasi['Emergency Contact Person'] = updates[key];
        data_registrasi['emergency_contact_person'] = updates[key];
      } else if (key === 'emergency_contact_number') {
        data_registrasi['Emergency Contact Number'] = updates[key];
        data_registrasi['emergency_contact_number'] = updates[key];
      } else {
        data_registrasi[key] = updates[key];
      }
    });

    const updateQuery = `
      UPDATE registrasi_new_seluruh_cabang 
      SET data_registrasi = $1, cabang = $2 
      WHERE id = $3 
      RETURNING *
    `;
    const result = await db.query(updateQuery, [JSON.stringify(data_registrasi), newCabang, id]);

    res.json({
      success: true,
      message: 'Data berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating registrasi_new_seluruh_cabang:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM registrasi_new_seluruh_cabang WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({
      success: true,
      message: 'Data berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting registrasi_new_seluruh_cabang:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
