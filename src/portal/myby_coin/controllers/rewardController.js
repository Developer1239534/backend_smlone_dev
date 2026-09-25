/**
 * ============================================================
 * MYBY COIN - REWARD & REDEEM CONTROLLER
 * ============================================================
 * Menangani:
 * 1. GET /rewards (katalog reward resmi)
 * 2. POST /redeem (penukaran merchandise dengan koin)
 * Kolom "ID" sebagai Primary Key dan "Name" sebagai Secondary Key.
 * ============================================================
 */

const db = require('../../../db/neonClient');
const { ensureMyByCoinTables, getTraineeProfile } = require('../mybyCoinDatabase');

/**
 * GET /rewards
 * Mengambil katalog reward merchandise resmi
 */
async function handleGetRewards(req, res) {
  try {
    await ensureMyByCoinTables();
    const result = await db.query(`
      SELECT id, title, category, cost, stock, image_url, tag, description
      FROM myby_rewards_catalog
      WHERE is_active = TRUE
      ORDER BY cost ASC
    `);

    const data = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      cost: Number(r.cost),
      stock: Number(r.stock),
      image: r.image_url,
      tag: r.tag,
      description: r.description
    }));

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('[MyBy Coin] GET /rewards error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /redeem
 * Penukaran reward menggunakan saldo koin anak secara atomic
 */
async function handleRedeemReward(req, res) {
  const { traineeId, rewardId, notes } = req.body;
  if (!traineeId || !rewardId) {
    return res.status(400).json({ success: false, message: 'traineeId dan rewardId wajib diisi.' });
  }

  try {
    await ensureMyByCoinTables();
    const profile = await getTraineeProfile(traineeId);

    // 1. Ambil detail reward
    const rewardRes = await db.query('SELECT * FROM myby_rewards_catalog WHERE id = $1 LIMIT 1', [rewardId]);
    if (rewardRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reward tidak ditemukan.' });
    }
    const reward = rewardRes.rows[0];

    if (reward.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Stok hadiah ini sedang habis.' });
    }

    // 2. Ambil saldo wallet anak
    const walletRes = await db.query(
      'SELECT * FROM myby_trainee_wallets WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) OR "Name" = $2 LIMIT 1',
      [profile.ID, profile.Name]
    );
    if (walletRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Dompet anak belum terdaftar.' });
    }
    const wallet = walletRes.rows[0];

    if (Number(wallet.balance) < Number(reward.cost)) {
      return res.status(400).json({
        success: false,
        message: `Saldo MYBY Coin tidak mencukupi. Saldo Anda: ${wallet.balance}, Diperlukan: ${reward.cost}`
      });
    }

    // Eksekusi transaksi potong saldo & potong stok
    await db.query('BEGIN');

    // Potong koin
    const updatedWallet = await db.query(`
      UPDATE myby_trainee_wallets
      SET balance = balance - $1,
          total_spent = total_spent + $1,
          updated_at = NOW()
      WHERE "ID" = $2
      RETURNING balance
    `, [reward.cost, profile.ID]);

    // Kurangi stok
    await db.query(`
      UPDATE myby_rewards_catalog
      SET stock = stock - 1
      WHERE id = $1
    `, [rewardId]);

    // Catat mutasi spend
    const txId = `tx-red-${Date.now()}`;
    await db.query(`
      INSERT INTO myby_coin_transactions (id, "ID", "Name", title, amount, type, badge)
      VALUES ($1, $2, $3, $4, $5, 'spend', 'Redeem')
    `, [txId, profile.ID, profile.Name, `Redeem Hadiah: ${reward.title}`, reward.cost]);

    // Catat pengajuan redeem
    const redeemId = `red-${Date.now()}`;
    await db.query(`
      INSERT INTO myby_redeem_requests (id, "ID", "Name", reward_id, reward_title, coins_spent, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [redeemId, profile.ID, profile.Name, reward.id, reward.title, reward.cost, notes || '']);

    await db.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Berhasil menukarkan "${reward.title}"! Tim SMLONE akan segera memproses hadiah Anda.`,
      data: {
        redeemId,
        rewardTitle: reward.title,
        coinsSpent: Number(reward.cost),
        remainingBalance: Number(updatedWallet.rows[0].balance)
      }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('[MyBy Coin] POST /redeem error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  handleGetRewards,
  handleRedeemReward
};
