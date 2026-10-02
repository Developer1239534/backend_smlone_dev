const db = require('../db/neonClient');

// Helper ensureTable sekali saat booting
let ensureTablePromise = null;
function ensureStudentLevel6ReportsTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = db.query(`
      CREATE TABLE IF NOT EXISTS student_level6_reports (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        report_type VARCHAR(100),
        report_title VARCHAR(150) NOT NULL,
        report_link TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_student_report UNIQUE (student_id, report_title)
      );
      CREATE INDEX IF NOT EXISTS idx_student_l6_id ON student_level6_reports(student_id);
    `).catch(err => {
      console.error('[StudentLevel6] Ensure table error:', err.message);
    });
  }
  return ensureTablePromise;
}
ensureStudentLevel6ReportsTable();

/**
 * GET /api/v1/students/:id/level6-reports
 * Mengambil seluruh riwayat laporan Level 6 milik siswa berdasarkan student_id
 */
async function getStudentLevel6Reports(req, res) {
  try {
    const rawId = String(req.params.id || '').trim();
    // Ekstraksi numeric ID (toleran jika ada prefix seperti 'sml-')
    const numericPart = rawId.replace(/\D+/g, '');
    const studentId = parseInt(numericPart, 10);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: `ID siswa tidak valid: "${rawId}". ID harus berupa angka.`
      });
    }

    const query = `
      SELECT 
        id,
        student_id,
        report_type,
        report_title,
        report_link,
        created_at
      FROM student_level6_reports
      WHERE student_id = $1
      ORDER BY created_at DESC, id DESC
    `;

    const result = await db.query(query, [studentId]);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[StudentLevel6] GET level6-reports error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data laporan Level 6.',
      error: error.message
    });
  }
}

/**
 * POST /api/v1/students/:id/level6-reports
 * Endpoint sinkronisasi/upsert laporan (untuk n8n HTTP Request node / manual sync)
 * Menerima single object atau array of objects
 */
async function upsertStudentLevel6Reports(req, res) {
  try {
    const rawId = String(req.params.id || '').trim();
    const numericPart = rawId.replace(/\D+/g, '');
    const defaultStudentId = parseInt(numericPart, 10);

    let body = req.body;
    let items = Array.isArray(body) ? body : (body.data && Array.isArray(body.data) ? body.data : [body]);

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: 'Payload tidak boleh kosong.'
      });
    }

    const saved = [];
    for (const item of items) {
      const sId = item.student_id ? parseInt(String(item.student_id).replace(/\D+/g, ''), 10) : defaultStudentId;
      const reportType = item.report_type || item.type || null;
      const reportTitle = String(item.report_title || item.title || '').trim();
      const reportLink = String(item.report_link || item.link || item.url || '').trim();

      if (isNaN(sId) || !reportTitle || !reportLink) {
        continue;
      }

      const q = `
        INSERT INTO student_level6_reports (
          student_id, report_type, report_title, report_link, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, report_title)
        DO UPDATE SET
          report_type = EXCLUDED.report_type,
          report_link = EXCLUDED.report_link,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, student_id, report_type, report_title, report_link, created_at;
      `;
      const r = await db.query(q, [sId, reportType, reportTitle, reportLink]);
      if (r.rows.length) {
        saved.push(r.rows[0]);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Berhasil menyinkronkan ${saved.length} data laporan Level 6.`,
      data: saved
    });
  } catch (error) {
    console.error('[StudentLevel6] POST level6-reports error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyinkronkan data laporan Level 6.',
      error: error.message
    });
  }
}

module.exports = {
  getStudentLevel6Reports,
  upsertStudentLevel6Reports,
  ensureStudentLevel6ReportsTable
};
