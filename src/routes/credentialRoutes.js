const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// 1. GET / - Ambil semua data Credential Portal
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM credential_portal';
    let params = [];

    if (search) {
      query += ' WHERE "ID" ILIKE $1 OR "Name" ILIKE $1 OR "MEMBERSHIP STATUS" ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY "ID" ASC';

    const result = await db.query(query, params);
    
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua data Credential Portal.',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[Credential Portal] GET / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Credential Portal dari database.',
      error: error.message
    });
  }
});

// 2. GET /:id - Ambil satu data Credential Portal berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM credential_portal WHERE "ID" = $1 OR "ID" ILIKE $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Credential Portal dengan ID: "${id}" tidak ditemukan.`
      });
    }

    const row = result.rows[0];
    return res.status(200).json({
      success: true,
      message: `Berhasil mengambil data Credential Portal ID: ${id}.`,
      data: {
        ID: row["ID"],
        Name: row["Name"],
        "MEMBERSHIP STATUS": row["MEMBERSHIP STATUS"],
        Password: row["Password"]
      }
    });
  } catch (error) {
    console.error('[Credential Portal] GET /:id error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail data dari database.',
      error: error.message
    });
  }
});

// 3. POST / - Tambah data baru (Single Item)
router.post('/', async (req, res) => {
  try {
    const { ID, id, Name, name, "MEMBERSHIP STATUS": membership_status_raw, membership_status, Password, password } = req.body;

    const finalId = String(ID ?? id ?? '').trim();
    const finalName = String(Name ?? name ?? '').trim();
    const finalStatus = String(membership_status_raw ?? membership_status ?? '').trim();
    const finalPassword = String(Password ?? password ?? '').trim();

    if (!finalId) {
      return res.status(400).json({
        success: false,
        message: 'Kolom "ID" wajib diisi.'
      });
    }

    const insertResult = await db.query(`
      INSERT INTO credential_portal ("ID", "Name", "MEMBERSHIP STATUS", "Password")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("ID") DO UPDATE 
      SET "Name" = EXCLUDED."Name",
          "MEMBERSHIP STATUS" = EXCLUDED."MEMBERSHIP STATUS",
          "Password" = EXCLUDED."Password"
      RETURNING *;
    `, [finalId, finalName, finalStatus, finalPassword]);

    return res.status(201).json({
      success: true,
      message: 'Data Credential Portal berhasil disimpan/diperbarui.',
      data: insertResult.rows[0]
    });
  } catch (error) {
    console.error('[Credential Portal] POST / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data baru ke database.',
      error: error.message
    });
  }
});

// 4. POST /push - Bulk Insert / Upsert (Cocok untuk sinkronisasi n8n / Sheets / Array JSON)
router.post('/push', async (req, res) => {
  try {
    let data = req.body;

    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data array kosong.' });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const id = String(row['ID'] ?? row['id'] ?? '').trim();
      const name = String(row['Name'] ?? row['name'] ?? row['Nama'] ?? row['nama'] ?? '').trim();
      const membershipStatus = String(row['MEMBERSHIP STATUS'] ?? row['Membership Status'] ?? row['membership_status'] ?? row['membership'] ?? '').trim();
      const password = String(row['Password'] ?? row['password'] ?? '').trim();

      if (!id) {
        skippedCount++;
        continue;
      }

      try {
        await db.query(`
          INSERT INTO credential_portal ("ID", "Name", "MEMBERSHIP STATUS", "Password")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT ("ID") DO UPDATE 
          SET "Name" = EXCLUDED."Name",
              "MEMBERSHIP STATUS" = EXCLUDED."MEMBERSHIP STATUS",
              "Password" = EXCLUDED."Password";
        `, [id, name, membershipStatus, password]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id, error: rowError.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Sinkronisasi selesai. Berhasil: ${insertedCount}, Dilewati: ${skippedCount}, Gagal: ${errorCount}`,
      details: { insertedCount, skippedCount, errorCount, errors }
    });
  } catch (error) {
    console.error('[Credential Portal] POST /push error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal saat bulk push.',
      error: error.message
    });
  }
});

// 5. PUT /:id - Update data Credential Portal berdasarkan ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { Name, name, "MEMBERSHIP STATUS": membership_status_raw, membership_status, Password, password } = req.body;

    const finalName = Name ?? name;
    const finalStatus = membership_status_raw ?? membership_status;
    const finalPassword = Password ?? password;

    const checkRes = await db.query('SELECT * FROM credential_portal WHERE "ID" = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data dengan ID: "${id}" tidak ditemukan.`
      });
    }

    const existing = checkRes.rows[0];
    const updateName = finalName !== undefined ? String(finalName).trim() : existing["Name"];
    const updateStatus = finalStatus !== undefined ? String(finalStatus).trim() : existing["MEMBERSHIP STATUS"];
    const updatePass = finalPassword !== undefined ? String(finalPassword).trim() : existing["Password"];

    const updateRes = await db.query(`
      UPDATE credential_portal
      SET "Name" = $2, "MEMBERSHIP STATUS" = $3, "Password" = $4
      WHERE "ID" = $1
      RETURNING *;
    `, [id, updateName, updateStatus, updatePass]);

    return res.status(200).json({
      success: true,
      message: `Data ID: ${id} berhasil diperbarui.`,
      data: updateRes.rows[0]
    });
  } catch (error) {
    console.error('[Credential Portal] PUT /:id error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data.',
      error: error.message
    });
  }
});

// 6. DELETE /:id - Hapus data berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteRes = await db.query(
      'DELETE FROM credential_portal WHERE "ID" = $1 RETURNING *;',
      [id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ditemukan data dengan ID: "${id}".`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Data Credential Portal ID: ${id} berhasil dihapus.`,
      deleted: deleteRes.rows[0]
    });
  } catch (error) {
    console.error('[Credential Portal] DELETE /:id error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data.',
      error: error.message
    });
  }
});

module.exports = router;
