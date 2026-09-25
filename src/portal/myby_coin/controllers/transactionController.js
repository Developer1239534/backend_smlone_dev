/**
 * ============================================================
 * MYBY COIN - TRANSACTION CONTROLLER
 * ============================================================
 * Menampilkan riwayat transaksi koin anak.
 * Murni hanya riwayat rentetan login (Day X Streak).
 * Kolom "ID" sebagai Primary Key dan "Name" sebagai Secondary Key.
 * ============================================================
 */

const db = require('../../../db/neonClient');
const { ensureMyByCoinTables, getTraineeProfile } = require('../mybyCoinDatabase');

/**
 * GET /transactions/:traineeId
 * Mengambil buku kas mutasi koin login streak anak
 */
async function handleGetTransactions(req, res) {
  const traineeId = req.params.traineeId || req.query.traineeId || req.query.id;
  const { limit = 20 } = req.query;

  if (!traineeId) {
    return res.status(400).json({ success: false, message: 'traineeId wajib disertakan.' });
  }

  try {
    await ensureMyByCoinTables();
    const profile = await getTraineeProfile(traineeId);

    const result = await db.query(`
      SELECT id, "ID", "Name", title, amount, type, badge, created_at
      FROM myby_coin_transactions
      WHERE ("ID" = $1 OR LOWER("ID") = LOWER($1) OR "Name" = $2 OR LOWER("Name") = LOWER($2))
        AND (badge = 'Streak Reward' OR title ILIKE '%Streak%')
      ORDER BY created_at DESC
      LIMIT $3
    `, [profile.ID, profile.Name, Number(limit)]);

    const data = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      amount: Number(row.amount),
      type: row.type,
      badge: row.badge,
      date: new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta'
      }).format(new Date(row.created_at))
    }));

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('[MyBy Coin] GET /transactions error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  handleGetTransactions
};
