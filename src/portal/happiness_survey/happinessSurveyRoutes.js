const express = require('express');
const router = express.Router();
const mysql = require('../../db/mysqlClient');
const { Pool } = require('pg');
require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatMonthLabel(monthKey) {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [y, m] = monthKey.split('-');
  const mIdx = parseInt(m, 10) - 1;
  const mName = MONTH_NAMES_ID[mIdx] || m;
  return `${mName} ${y}`;
}

function normalizeBranchCode(raw) {
  if (!raw) return 'CA';
  const s = String(raw).trim().toLowerCase();
  if (s === 'ca' || s.includes('cemara')) return 'CA';
  if (s === 'cp' || s.includes('timor') || s.includes('centre') || s.includes('center')) return 'CP';
  if (s === 'tr' || s.includes('tritura')) return 'TR';
  return 'CA';
}

// 1. GET /check/:traineeId - Cek apakah trainee sudah mengisi survei bulan ini
router.get('/check/:traineeId', async (req, res) => {
  try {
    const traineeId = String(req.params.traineeId || '').trim();
    const month = String(req.query.month || getCurrentMonthKey()).trim();

    if (!traineeId) {
      return res.status(400).json({ success: false, message: 'ID Trainee diperlukan' });
    }

    // KETAT SESUAI ARAHAN BOS RAKHA: Hanya aktif di akun preview ID 9999
    if (traineeId !== '9999') {
      return res.json({
        success: true,
        hasSubmitted: true, // Non-9999 dipastikan tidak akan memunculkan pop-up sama sekali
        submission: null,
        currentMonth: month,
        currentMonthLabel: formatMonthLabel(month)
      });
    }

    const result = await mysql.query(
      'SELECT id, trainee_id, nama, kelas, cabang, bulan, hasil, catatan, created_at, updated_at FROM monthly_happiness_surveys WHERE trainee_id = ? AND bulan = ? LIMIT 1',
      [traineeId, month]
    );

    const submission = result.rows.length > 0 ? result.rows[0] : null;

    res.json({
      success: true,
      hasSubmitted: Boolean(submission),
      submission,
      currentMonth: month,
      currentMonthLabel: formatMonthLabel(month)
    });
  } catch (err) {
    console.error('[HappinessSurvey] Check error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memeriksa status survei' });
  }
});

// 2. POST /submit - Simpan respon survei kebahagiaan
router.post('/submit', async (req, res) => {
  try {
    const { traineeId, name, className, branch, score, note, month } = req.body;
    const cleanId = String(traineeId || '').trim();
    const cleanScore = parseInt(score, 10);
    const cleanMonth = String(month || getCurrentMonthKey()).trim();

    if (!cleanId) {
      return res.status(400).json({ success: false, message: 'ID Trainee tidak boleh kosong' });
    }

    // KETAT SESUAI ARAHAN BOS RAKHA: Pengiriman survei hanya diizinkan untuk ID 9999
    if (cleanId !== '9999') {
      return res.status(403).json({
        success: false,
        message: 'Fitur survei kebahagiaan saat ini khusus aktif untuk akun preview ID 9999.'
      });
    }

    if (isNaN(cleanScore) || cleanScore < 1 || cleanScore > 5) {
      return res.status(400).json({ success: false, message: 'Skor harus bernilai 1 hingga 5' });
    }

    // Ambil profil jika nama/kelas belum dikirim
    let traineeName = String(name || '').trim();
    let traineeClass = String(className || '').trim();
    let traineeBranch = String(branch || '').trim();

    if (!traineeName || !traineeBranch) {
      const p = await mysql.query(
        'SELECT Name, Class, Branch FROM profile_trainee WHERE ID = ? LIMIT 1',
        [cleanId]
      );
      if (p.rows.length > 0) {
        if (!traineeName) traineeName = p.rows[0].Name || `Trainee ${cleanId}`;
        if (!traineeClass) traineeClass = p.rows[0].Class || '-';
        if (!traineeBranch) traineeBranch = p.rows[0].Branch || 'SMLONE Cemara Asri';
      } else {
        traineeName = traineeName || `Trainee ${cleanId}`;
      }
    }

    const branchCode = normalizeBranchCode(traineeBranch);

    // Upsert ke MariaDB
    await mysql.query(`
      INSERT INTO monthly_happiness_surveys (
        trainee_id, nama, kelas, cabang, bulan, hasil, catatan, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        kelas = VALUES(kelas),
        cabang = VALUES(cabang),
        hasil = VALUES(hasil),
        catatan = VALUES(catatan),
        updated_at = NOW()
    `, [cleanId, traineeName, traineeClass, branchCode, cleanMonth, cleanScore, note || null]);

    // Paritas ke Neon PG jika tersedia
    if (process.env.DATABASE_URL) {
      try {
        const pg = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        await pg.query(`
          INSERT INTO monthly_happiness_surveys (
            trainee_id, nama, kelas, cabang, bulan, hasil, catatan, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          ON CONFLICT (trainee_id, bulan) DO UPDATE SET
            nama = EXCLUDED.nama,
            kelas = EXCLUDED.kelas,
            cabang = EXCLUDED.cabang,
            hasil = EXCLUDED.hasil,
            catatan = EXCLUDED.catatan,
            updated_at = NOW()
        `, [cleanId, traineeName, traineeClass, branchCode, cleanMonth, cleanScore, note || null]);
        await pg.end();
      } catch (pgErr) {
        console.warn('[HappinessSurvey] Neon sync warning:', pgErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Terima kasih atas tanggapanmu! Penilaianmu sangat berarti untuk kemajuan SMLONE.',
      data: {
        traineeId: cleanId,
        nama: traineeName,
        kelas: traineeClass,
        cabang: branchCode,
        bulan: cleanMonth,
        hasil: cleanScore,
        catatan: note || null
      }
    });
  } catch (err) {
    console.error('[HappinessSurvey] Submit error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengirimkan survei kebahagiaan' });
  }
});

// 3. GET /admin/summary - Rekapitulasi metrik halaman admin (Total Happiness Score & Avg Happiness Score)
router.get('/admin/summary', async (req, res) => {
  try {
    const selectedMonth = String(req.query.month || getCurrentMonthKey()).trim();

    // 1. Ambil daftar bulan yang tersedia
    const monthsResult = await mysql.query(
      'SELECT DISTINCT bulan FROM monthly_happiness_surveys ORDER BY bulan DESC'
    );
    let availableMonths = monthsResult.rows.map(r => r.bulan);
    if (!availableMonths.includes(selectedMonth)) {
      availableMonths.unshift(selectedMonth);
    }
    const formattedMonths = availableMonths.map(m => ({
      key: m,
      label: formatMonthLabel(m)
    }));

    // 2. Agregasi per cabang untuk bulan terpilih (CA, CP, TR)
    const statsResult = await mysql.query(`
      SELECT 
        cabang,
        COUNT(*) as total_respondents,
        AVG(hasil) as avg_score,
        SUM(hasil) as total_score
      FROM monthly_happiness_surveys
      WHERE bulan = ?
      GROUP BY cabang
    `, [selectedMonth]);

    const counts = { CA: 0, CP: 0, TR: 0, Total: 0 };
    const averages = { CA: 0, CP: 0, TR: 0, Total: 0 };
    let sumTotalScore = 0;
    let sumTotalRespondents = 0;

    statsResult.rows.forEach(r => {
      const b = r.cabang;
      const cnt = parseInt(r.total_respondents, 10) || 0;
      const avg = parseFloat(r.avg_score) || 0;
      const totScore = parseFloat(r.total_score) || 0;

      if (counts[b] !== undefined) {
        counts[b] = cnt;
        averages[b] = Number(avg.toFixed(2));
      }
      sumTotalRespondents += cnt;
      sumTotalScore += totScore;
    });

    counts.Total = sumTotalRespondents;
    averages.Total = sumTotalRespondents > 0 ? Number((sumTotalScore / sumTotalRespondents).toFixed(2)) : 0;

    // 3. Distribusi skor (1 sampai 5)
    const distResult = await mysql.query(`
      SELECT hasil, COUNT(*) as cnt
      FROM monthly_happiness_surveys
      WHERE bulan = ?
      GROUP BY hasil
      ORDER BY hasil ASC
    `, [selectedMonth]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distResult.rows.forEach(r => {
      const h = parseInt(r.hasil, 10);
      if (distribution[h] !== undefined) {
        distribution[h] = parseInt(r.cnt, 10) || 0;
      }
    });

    // 4. Daftar respon terbaru (hingga 100)
    const listResult = await mysql.query(`
      SELECT id, trainee_id, nama, kelas, cabang, bulan, hasil, catatan, created_at
      FROM monthly_happiness_surveys
      WHERE bulan = ?
      ORDER BY created_at DESC
      LIMIT 100
    `, [selectedMonth]);

    res.json({
      success: true,
      month: selectedMonth,
      monthLabel: formatMonthLabel(selectedMonth),
      availableMonths: formattedMonths,
      metrics: {
        totalHappinessScore: counts,       // "Total Happiness Score this month / Jumlah yg mengisi"
        avgHappinessScore: averages        // "Avg Happiness score this month / Nilai rata-rata yg mengisi"
      },
      distribution,
      responses: listResult.rows
    });
  } catch (err) {
    console.error('[HappinessSurvey] Admin summary error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil rekapitulasi survei admin' });
  }
});

// 4. POST /preview/reset - Khusus reset respon ID 9999 agar bisa dites ulang kapan saja
router.post('/preview/reset', async (req, res) => {
  try {
    const traineeId = String(req.body.traineeId || '9999').trim();
    const month = String(req.body.month || getCurrentMonthKey()).trim();

    await mysql.query(
      'DELETE FROM monthly_happiness_surveys WHERE trainee_id = ? AND bulan = ?',
      [traineeId, month]
    );

    if (process.env.DATABASE_URL) {
      try {
        const pg = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        await pg.query('DELETE FROM monthly_happiness_surveys WHERE trainee_id = $1 AND bulan = $2', [traineeId, month]);
        await pg.end();
      } catch {}
    }

    res.json({
      success: true,
      message: `Status survei akun ${traineeId} untuk bulan ${month} berhasil direset. Silakan refresh dashboard untuk mencoba pop-up lagi!`
    });
  } catch (err) {
    console.error('[HappinessSurvey] Reset preview error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mereset status survei preview' });
  }
});

module.exports = router;
