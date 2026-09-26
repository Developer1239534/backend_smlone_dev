const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

// Helper to ensure credential_admin table exists
async function ensureCredentialAdminTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.credential_admin (
        id SERIAL PRIMARY KEY,
        "Nama" VARCHAR(255) UNIQUE NOT NULL,
        "Password" VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('[Credential Admin] Ensure table error:', err.message);
  }
}

// 1. GET / - Ambil semua data Credential Admin
router.get('/', async (req, res) => {
  try {
    await ensureCredentialAdminTable();
    const { search } = req.query;
    let query = 'SELECT id, "Nama", "Password", created_at, updated_at FROM public.credential_admin';
    let params = [];

    if (search) {
      query += ' WHERE "Nama" ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY id ASC';

    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua data Credential Admin.',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[Credential Admin] GET / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Credential Admin dari database.',
      error: error.message
    });
  }
});

// 2. GET /:identifier - Ambil satu data berdasarkan ID atau Nama/Email
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    await ensureCredentialAdminTable();
    const isNumeric = /^\d+$/.test(identifier);

    let query = '';
    let params = [];

    if (isNumeric) {
      query = 'SELECT id, "Nama", "Password", created_at, updated_at FROM public.credential_admin WHERE id = $1 LIMIT 1';
      params = [parseInt(identifier, 10)];
    } else {
      query = 'SELECT id, "Nama", "Password", created_at, updated_at FROM public.credential_admin WHERE "Nama" = $1 OR "Nama" ILIKE $1 LIMIT 1';
      params = [identifier];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Credential Admin "${identifier}" tidak ditemukan.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Berhasil mengambil data Credential Admin: ${identifier}.`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Credential Admin] GET /:identifier error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail data Credential Admin.',
      error: error.message
    });
  }
});

// 3. POST /login - Autentikasi / Verifikasi Admin
router.post('/login', async (req, res) => {
  try {
    await ensureCredentialAdminTable();
    const { Nama, nama, email, Email, Password, password } = req.body;

    const inputUser = String(Nama ?? nama ?? email ?? Email ?? '').trim();
    const inputPass = String(Password ?? password ?? '').trim();

    if (!inputUser || !inputPass) {
      return res.status(400).json({
        success: false,
        message: 'Nama/Email dan Password wajib diisi.'
      });
    }

    const result = await db.query(
      'SELECT id, "Nama", "Password" FROM public.credential_admin WHERE "Nama" = $1 OR "Nama" ILIKE $1 LIMIT 1',
      [inputUser]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Akun admin tidak ditemukan atau kredensial salah.'
      });
    }

    const admin = result.rows[0];

    if (admin.Password !== inputPass) {
      return res.status(401).json({
        success: false,
        message: 'Password yang dimasukkan salah.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login admin berhasil.',
      data: {
        id: admin.id,
        Nama: admin.Nama
      }
    });
  } catch (error) {
    console.error('[Credential Admin] POST /login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.',
      error: error.message
    });
  }
});

// 4. POST / - Tambah atau Update data Admin (Upsert)
router.post('/', async (req, res) => {
  try {
    await ensureCredentialAdminTable();
    const { Nama, nama, email, Email, Password, password } = req.body;

    const finalNama = String(Nama ?? nama ?? email ?? Email ?? '').trim();
    const finalPassword = String(Password ?? password ?? '').trim();

    if (!finalNama || !finalPassword) {
      return res.status(400).json({
        success: false,
        message: 'Field "Nama" (email admin) dan "Password" wajib diisi.'
      });
    }

    const insertResult = await db.query(`
      INSERT INTO public.credential_admin ("Nama", "Password")
      VALUES ($1, $2)
      ON CONFLICT ("Nama") DO UPDATE
      SET "Password" = EXCLUDED."Password",
          updated_at = CURRENT_TIMESTAMP
      RETURNING id, "Nama", "Password", created_at, updated_at;
    `, [finalNama, finalPassword]);

    return res.status(201).json({
      success: true,
      message: 'Data Credential Admin berhasil disimpan/diperbarui.',
      data: insertResult.rows[0]
    });
  } catch (error) {
    console.error('[Credential Admin] POST / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Credential Admin ke database.',
      error: error.message
    });
  }
});

// 5. DELETE /:identifier - Hapus Admin berdasarkan ID atau Nama
router.delete('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    await ensureCredentialAdminTable();
    const isNumeric = /^\d+$/.test(identifier);

    let query = '';
    let params = [];

    if (isNumeric) {
      query = 'DELETE FROM public.credential_admin WHERE id = $1 RETURNING id, "Nama"';
      params = [parseInt(identifier, 10)];
    } else {
      query = 'DELETE FROM public.credential_admin WHERE "Nama" = $1 OR "Nama" ILIKE $1 RETURNING id, "Nama"';
      params = [identifier];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Credential Admin "${identifier}" tidak ditemukan.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Data Credential Admin "${identifier}" berhasil dihapus.`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Credential Admin] DELETE /:identifier error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data Credential Admin.',
      error: error.message
    });
  }
});

module.exports = router;
