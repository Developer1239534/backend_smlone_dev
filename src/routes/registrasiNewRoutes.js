const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper untuk parsing data registrasi dengan robust
const parseRegistrasiData = (row) => {
  const data = row.data_registrasi || {};
  
  // Pemetaan robust dari Google Sheets (n8n) maupun React FE (camelCase)
  const email_address = data['email'] || data['Email'] || data['Email Address'] || data['email_address'] || data['emailAddress'] || '';
  const full_name = data['fullName'] || data['Full Name'] || data['full_name'] || data['name'] || data['Name'] || '';
  const dob = data['dob'] || data['Date of Birth'] || data['dateOfBirth'] || data['date_of_birth'] || '';
  const gender = data['gender'] || data['Gender'] || '';
  const address = data['address'] || data['Address'] || '';
  
  const contact_whatsapp = data['contact'] || data['Contact / Whatsapp No.'] || data['Contact / Whatsapp'] || 
                           data['contact_whatsapp'] || data['contactWhatsapp'] || data['phone'] || data['whatsapp'] || '';
  
  const program = data['programSelected'] || data['Program'] || data['program'] || '';
  const pernah_ikut_program = data['hasPriorProgram'] || data['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || data['pernah_ikut_program'] || '';
  
  let program_pernah_diikuti = '';
  if (Array.isArray(data['priorPrograms'])) {
    program_pernah_diikuti = data['priorPrograms'].join(', ');
  } else {
    program_pernah_diikuti = data['priorPrograms'] || data['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || 
                             data['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikut'] || 
                             data['Program yang pernah diikuti'] || data['program_pernah_diikuti'] || '';
  }
  if (data['otherProgramText']) {
    program_pernah_diikuti += program_pernah_diikuti ? ` (${data['otherProgramText']})` : data['otherProgramText'];
  }

  const todays_date = data['todayDate'] || data["Today's Date"] || data['todays_date'] || data['date'] || '';
  
  let i_agree_doc = '';
  if (data['consent'] !== undefined) {
    i_agree_doc = data['consent'] ? 'Setuju' : 'Tidak Setuju';
  } else {
    i_agree_doc = data['Consent Box (Persetujuan Dokumentasi)'] || 
                  data['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || '';
  }

  const program_dipilih = data['subProgramSelected'] || data['Apprentice/Junior/Youth SMLONE Program Yang Dipilih'] || data['Program Yang Dipilih'] || data['program_dipilih'] || '';
  const nama_sekolah = data['schoolName'] || data['Nama Sekolah (Peserta Training)'] || data['Nama Sekolah (Peserta Training)1'] || data['nama_sekolah'] || '';
  const kelas_peserta = data['schoolGrade'] || data['Kelas (Peserta Training)'] || data['Kelas (Peserta Training)1'] || data['kelas_peserta'] || '';
  const parents_email = data['parentEmail'] || data["Parent's Email"] || data["Parent's Email1"] || data['parents_email'] || '';
  const emergency_contact_person = data['emergencyName'] || data['Emergency Contact Person'] || data['Emergency Contact Person1'] || data['emergency_contact_person'] || '';
  const emergency_contact_number = data['emergencyNumber'] || data['Emergency Contact Number'] || data['Emergency Contact Number1'] || data['emergency_contact_number'] || '';
  const tahu_smlone_dari = data['referralSource'] || data['Dari Manakah Anda Mengetahui SMLONE?'] || data['Dari Manakah Anda Mengetahui SMLONE?1'] || data['tahu_smlone_dari'] || '';
  
  let referensi_teman = data['referralFriendName'] || data['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || '';
  if (data['referralOtherText']) {
    referensi_teman += referensi_teman ? ` (${data['referralOtherText']})` : data['referralOtherText'];
  }

  const ig_mama = data['instagramMama'] || data['Akun Instagram Mama'] || data['Akun Instagram Mama1'] || data['ig_mama'] || '';
  const ig_papa = data['instagramPapa'] || data['Akun Instagram Papa'] || data['Akun Instagram Papa1'] || data['ig_papa'] || '';
  const ig_anak = data['instagramAnak'] || data['Akun Instagram Anak'] || data['Akun Instagram Anak1'] || data['ig_anak'] || '';
  const cabang = row.cabang || data['cabang'] || data['Cabang'] || data['branch'] || data['branchSelected'] || '';
  const timestamp_str = data['Timestamp'] || data['timestamp_str'] || '';

  return {
    id: row.id,
    email_address,
    full_name,
    dob,
    gender,
    address,
    contact_whatsapp,
    program,
    pernah_ikut_program,
    program_pernah_diikuti,
    todays_date,
    i_agree_doc,
    program_dipilih,
    nama_sekolah,
    kelas_peserta,
    parents_email,
    emergency_contact_person,
    emergency_contact_number,
    tahu_smlone_dari,
    referensi_teman,
    ig_mama,
    ig_papa,
    ig_anak,
    cabang,
    class_branch: cabang,
    branch: cabang,
    timestamp_str,
    raw_data: data,
    created_at: row.created_at
  };
};

// GET endpoint: Ambil semua data dari registrasi_new_seluruh_cabang
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM registrasi_new_seluruh_cabang ORDER BY created_at DESC');
    const mapped = savedData.rows.map(row => parseRegistrasiData(row));

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
    
    res.json({
      success: true,
      data: parseRegistrasiData(result.rows[0])
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

    // Update keys in data_registrasi secara aman
    Object.keys(updates).forEach(key => {
      if (key === 'cabang') {
        newCabang = updates[key];
        data_registrasi['cabang'] = updates[key];
        data_registrasi['Cabang'] = updates[key];
        data_registrasi['branch'] = updates[key];
        data_registrasi['branchSelected'] = updates[key];
      } else if (key === 'email_address') {
        data_registrasi['Email Address'] = updates[key];
        data_registrasi['email_address'] = updates[key];
        data_registrasi['email'] = updates[key];
      } else if (key === 'full_name') {
        data_registrasi['Full Name'] = updates[key];
        data_registrasi['full_name'] = updates[key];
        data_registrasi['fullName'] = updates[key];
        data_registrasi['name'] = updates[key];
      } else if (key === 'contact_whatsapp') {
        data_registrasi['Contact / Whatsapp No.'] = updates[key];
        data_registrasi['contact_whatsapp'] = updates[key];
        data_registrasi['contact'] = updates[key];
      } else if (key === 'parents_email') {
        data_registrasi['Parent\'s Email'] = updates[key];
        data_registrasi['parents_email'] = updates[key];
        data_registrasi['parentEmail'] = updates[key];
      } else if (key === 'emergency_contact_person') {
        data_registrasi['Emergency Contact Person'] = updates[key];
        data_registrasi['emergency_contact_person'] = updates[key];
        data_registrasi['emergencyName'] = updates[key];
      } else if (key === 'emergency_contact_number') {
        data_registrasi['Emergency Contact Number'] = updates[key];
        data_registrasi['emergency_contact_number'] = updates[key];
        data_registrasi['emergencyNumber'] = updates[key];
      } else if (key === 'program') {
        data_registrasi['Program'] = updates[key];
        data_registrasi['program'] = updates[key];
        data_registrasi['programSelected'] = updates[key];
      } else if (key === 'program_dipilih') {
        data_registrasi['Program Yang Dipilih'] = updates[key];
        data_registrasi['program_dipilih'] = updates[key];
        data_registrasi['subProgramSelected'] = updates[key];
      } else if (key === 'nama_sekolah') {
        data_registrasi['Nama Sekolah (Peserta Training)'] = updates[key];
        data_registrasi['nama_sekolah'] = updates[key];
        data_registrasi['schoolName'] = updates[key];
      } else if (key === 'kelas_peserta') {
        data_registrasi['Kelas (Peserta Training)'] = updates[key];
        data_registrasi['kelas_peserta'] = updates[key];
        data_registrasi['schoolGrade'] = updates[key];
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
      data: parseRegistrasiData(result.rows[0])
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
