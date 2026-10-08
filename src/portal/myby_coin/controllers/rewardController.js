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
const { generateClaimPdf } = require('../../../utils/generateClaimPdf');

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

    // 2. Ambil saldo wallet anak (auto-init jika belum ada)
    let walletRes = await db.query(
      'SELECT * FROM myby_trainee_wallets WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) OR "Name" = $2 LIMIT 1',
      [profile.ID, profile.Name]
    );
    if (walletRes.rows.length === 0) {
      await db.query(
        'INSERT INTO myby_trainee_wallets ("ID", "Name", balance, total_earned) VALUES ($1, $2, 0, 0) ON CONFLICT ("ID") DO UPDATE SET "Name" = EXCLUDED."Name"',
        [profile.ID, profile.Name]
      );
      walletRes = await db.query(
        'SELECT * FROM myby_trainee_wallets WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) LIMIT 1',
        [profile.ID]
      );
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
    await db.query(`
      UPDATE myby_trainee_wallets
      SET balance = balance - $1,
          total_spent = total_spent + $1,
          updated_at = NOW()
      WHERE "ID" = $2
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
      INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge)
      VALUES ($1, $2, $3, $4, $5, 'spend', 'Klaim Hadiah')
    `, [txId, profile.ID, profile.Name, `Klaim Hadiah: ${reward.title}`, reward.cost]);

    // Catat pengajuan redeem
    const redeemId = `red-${Date.now()}`;
    await db.query(`
      INSERT INTO myby_redeem_requests (id, trainee_id, "Name", reward_id, reward_title, coins_spent, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [redeemId, profile.ID, profile.Name, reward.id, reward.title, reward.cost, notes || '']);

    await db.query('COMMIT');

    const wRes = await db.query('SELECT balance FROM myby_trainee_wallets WHERE "ID" = $1 LIMIT 1', [profile.ID]);
    const remainingBal = wRes.rows[0] ? wRes.rows[0].balance : 0;

    const claimEmail = req.body.email || profile.Email || profile.email || profile['Parents Email Account'] || '';
    setImmediate(async () => {
      try {
        let pdfBase64 = '';
        try {
          const pdfBuffer = await generateClaimPdf({
            redeemId,
            traineeId: profile.ID,
            traineeName: profile.Name,
            recipientEmail: claimEmail,
            rewardTitle: reward.title,
            coinsSpent: Number(reward.cost),
            remainingBalance: Number(remainingBal),
            branch: profile.Branch || profile.Cabang || '',
            program: profile.Program || ''
          });
          pdfBase64 = pdfBuffer.toString('base64');
        } catch (pdfErr) {
          console.error('[MyBy Coin] PDF gen error:', pdfErr.message);
        }

        await fetch('https://n8n-jua7.srv1825659.hstgr.cloud/webhook/gift-claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: profile.ID,
            name: profile.Name,
            email: claimEmail,
            gift: reward.title,
            gift_image: reward.image_url || '',
            coin_cost: Number(reward.cost),
            remaining_coin: Number(remainingBal),
            pdf_base64: pdfBase64,
            pdf_filename: `Bukti_Klaim_Hadiah_${profile.ID}.pdf`
          })
        });
      } catch (err) {
        console.error('[MyBy Coin] n8n webhook error:', err.message);
      }
    });

    return res.status(200).json({
      success: true,
      message: `Berhasil menukarkan "${reward.title}"! Tim SMLONE akan segera memproses hadiah Anda.`,
      data: {
        redeemId,
        rewardTitle: reward.title,
        coinsSpent: Number(reward.cost),
        remainingBalance: Number(remainingBal)
      }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('[MyBy Coin] POST /redeem error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /redeems/:traineeId
 * Mengambil daftar pengajuan redeem milik trainee tertentu
 */
async function handleGetTraineeRedeems(req, res) {
  const traineeId = req.params.traineeId || req.query.traineeId || req.query.id;
  if (!traineeId) {
    return res.status(400).json({ success: false, message: 'traineeId wajib disertakan.' });
  }

  try {
    await ensureMyByCoinTables();
    const profile = await getTraineeProfile(traineeId);

    const result = await db.query(
      `SELECT r.id, r.trainee_id, r.trainee_id AS "ID", r."Name", r.reward_id, r.reward_title, r.coins_spent, r.status, r.notes, r.created_at, r.updated_at,
              c.image_url, c.category, c.cost, c.description
       FROM myby_redeem_requests r
       LEFT JOIN myby_rewards_catalog c ON r.reward_id = c.id
       WHERE r.trainee_id = $1 OR LOWER(r.trainee_id) = LOWER($1) OR r."Name" = $2
       ORDER BY r.created_at DESC`,
      [profile.ID, profile.Name]
    );

    const rows = result.rows.map(row => ({
      ...row,
      traineeId: row.ID,
      traineeName: row.Name,
      rewardId: row.reward_id,
      rewardTitle: row.reward_title,
      coinsSpent: Number(row.coins_spent || 0),
      imageUrl: row.image_url || '',
      category: row.category || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('[MyBy Coin] GET /redeems/:traineeId error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  handleGetRewards,
  handleRedeemReward,
  handleGetTraineeRedeems
};
