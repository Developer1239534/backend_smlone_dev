const db = require('../../../db/neonClient');
const { ensureMyByCoinTables } = require('../mybyCoinDatabase');

/**
 * POST /calon-siswa
 * Pendaftaran calon siswa SMLONE dengan referral code opsional
 */
async function handleRegisterCalonSiswa(req, res) {
  const { name, phone, age, school, program, referral_code } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      error: 'Nama dan nomor telepon wajib diisi.'
    });
  }

  try {
    await ensureMyByCoinTables();

    let inviterId = null;
    let inviterName = null;

    if (referral_code && typeof referral_code === 'string') {
      const trimmedCode = referral_code.trim();
      const codeCheck = await db.query(
        'SELECT "ID", "Name" FROM referral_code WHERE LOWER(TRIM("Referral Code")) = LOWER($1) OR LOWER(TRIM("ID")) = LOWER($1) LIMIT 1',
        [trimmedCode]
      );
      if (codeCheck.rows.length > 0) {
        inviterId = codeCheck.rows[0].ID;
        inviterName = codeCheck.rows[0].Name;
      }
    }

    const insertQuery = `
      INSERT INTO calon_siswa_smlone (name, phone, age, school, program, referral_code, inviter_id, inviter_name, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'registered', NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      name.trim(),
      phone.trim(),
      age ? parseInt(age, 10) : null,
      school ? school.trim() : null,
      program ? program.trim() : null,
      referral_code ? referral_code.trim() : null,
      inviterId,
      inviterName
    ]);

    return res.status(201).json({
      success: true,
      message: 'Data calon siswa berhasil dicatat.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Calon Siswa] POST /calon-siswa error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /calon-siswa
 * Ambil daftar pendaftar calon siswa
 */
async function handleListCalonSiswa(req, res) {
  const { limit = 50, offset = 0, referral_code, inviter_id } = req.query;

  try {
    await ensureMyByCoinTables();

    let query = 'SELECT * FROM calon_siswa_smlone WHERE 1=1';
    const params = [];

    if (referral_code) {
      params.push(referral_code.trim());
      query += ` AND LOWER(referral_code) = LOWER($${params.length})`;
    }

    if (inviter_id) {
      params.push(inviter_id.trim());
      query += ` AND LOWER(inviter_id) = LOWER($${params.length})`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) FROM calon_siswa_smlone');

    return res.status(200).json({
      success: true,
      total: parseInt(countResult.rows[0].count, 10),
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[Calon Siswa] GET /calon-siswa error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  handleRegisterCalonSiswa,
  handleListCalonSiswa
};
