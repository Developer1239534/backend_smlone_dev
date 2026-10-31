const db = require('../../../db/neonClient');
const { ensureMyByCoinTables, getTraineeProfile } = require('../mybyCoinDatabase');

/**
 * Konfigurasi Resmi Event Referral SMLONE
 * - Berakhir: 14 November 2026, 23:59:59 WIB (Asia/Jakarta / UTC+7)
 * - Klaim Koin Dimulai: 15 November 2026, 00:00:00 WIB
 * - Nilai Koin: 2 Koin per teman pendaftar
 */
const REFERRAL_CONFIG = {
  EVENT_END_ISO: '2026-11-14T23:59:59+07:00',
  CLAIM_START_ISO: '2026-11-15T00:00:00+07:00',
  COIN_PER_REFERRAL: 2,
};

function getEventDates() {
  const now = new Date();
  const endDate = new Date(REFERRAL_CONFIG.EVENT_END_ISO);
  const claimStartDate = new Date(REFERRAL_CONFIG.CLAIM_START_ISO);

  return {
    now,
    isClosed: now.getTime() > endDate.getTime(),
    canClaim: now.getTime() >= claimStartDate.getTime(),
    endDate,
    claimStartDate,
  };
}

/**
 * Helper: Hitung total referral sah seorang trainee
 */
async function calculateTraineeReferrals(traineeId) {
  if (!traineeId) return 0;
  const cleanId = String(traineeId).trim();

  const query = `
    WITH link_count AS (
      SELECT COUNT(DISTINCT rl."ID") AS count
      FROM referral_link rl
      LEFT JOIN referral_code rc ON LOWER(TRIM(rl."Referal By")) = LOWER(TRIM(rc."Referral Code")) OR LOWER(TRIM(rl."Referal By")) = LOWER(TRIM(rc."ID"))
      WHERE (
        LOWER(TRIM(rl."Referal By")) = LOWER($1)
        OR LOWER(TRIM(rl."Referal By")) = LOWER(CONCAT('smlone-', $1))
        OR LOWER(TRIM(rl."Referal By")) = LOWER(CONCAT('myby-', $1))
        OR LOWER(TRIM(COALESCE(rc."ID", ''))) = LOWER($1)
      )
      AND LOWER(TRIM(rl."ID")) != LOWER($1)
    ),
    calon_count AS (
      SELECT COUNT(DISTINCT cs.id) AS count
      FROM calon_siswa_smlone cs
      LEFT JOIN referral_code rc ON LOWER(TRIM(cs.referral_code)) = LOWER(TRIM(rc."Referral Code"))
      WHERE (
        LOWER(TRIM(cs.inviter_id)) = LOWER($1)
        OR LOWER(TRIM(COALESCE(rc."ID", ''))) = LOWER($1)
      )
    )
    SELECT 
      (COALESCE((SELECT count FROM link_count), 0) + COALESCE((SELECT count FROM calon_count), 0))::int AS total_referrals
  `;

  try {
    const res = await db.query(query, [cleanId]);
    return res.rows[0] ? Number(res.rows[0].total_referrals || 0) : 0;
  } catch (err) {
    console.error('[ReferralEvent] calculateTraineeReferrals error:', err.message);
    return 0;
  }
}

/**
 * GET /api/portal/myby-coin/referral-event/status
 * Cek status event referral, batas waktu 14 November 2026, dan hak klaim koin trainee
 */
async function handleGetReferralEventStatus(req, res) {
  const traineeId = req.query.traineeId || req.query.id;

  try {
    await ensureMyByCoinTables();
    const { isClosed, canClaim, now } = getEventDates();

    let userStats = {
      traineeId: traineeId || null,
      totalReferrals: 0,
      coinPerReferral: REFERRAL_CONFIG.COIN_PER_REFERRAL,
      claimableCoins: 0,
      hasClaimed: false,
      claimedAt: null,
      claimedAmount: 0
    };

    if (traineeId) {
      const cleanId = String(traineeId).trim();
      const totalReferrals = await calculateTraineeReferrals(cleanId);
      const claimableCoins = totalReferrals * REFERRAL_CONFIG.COIN_PER_REFERRAL;

      // Cek apakah sudah pernah klaim bonus event referral di myby_coin_transactions
      const txCheck = await db.query(`
        SELECT id, amount, created_at 
        FROM myby_coin_transactions 
        WHERE (trainee_id = $1 OR LOWER(trainee_id) = LOWER($1))
          AND (badge = 'Referral Event Reward' OR title ILIKE '%referral event%' OR badge ILIKE '%referral event%')
        ORDER BY created_at DESC 
        LIMIT 1
      `, [cleanId]);

      const hasClaimed = txCheck.rows.length > 0;
      const claimTx = txCheck.rows[0];

      userStats = {
        traineeId: cleanId,
        totalReferrals,
        coinPerReferral: REFERRAL_CONFIG.COIN_PER_REFERRAL,
        claimableCoins,
        hasClaimed,
        claimedAt: hasClaimed ? claimTx.created_at : null,
        claimedAmount: hasClaimed ? Number(claimTx.amount) : 0
      };
    }

    return res.status(200).json({
      success: true,
      event: {
        title: 'Event Referral SMLONE 2026',
        endDate: REFERRAL_CONFIG.EVENT_END_ISO,
        claimStartDate: REFERRAL_CONFIG.CLAIM_START_ISO,
        isClosed,
        canClaim,
        serverTime: now.toISOString(),
        description: 'Event referral ditutup 14 November 2026 pukul 23:59 WIB. Klaim koin dapat dilakukan mulai 15 November 2026.'
      },
      data: userStats
    });
  } catch (error) {
    console.error('[ReferralEvent] handleGetReferralEventStatus error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil status event referral.' });
  }
}

/**
 * POST /api/portal/myby-coin/referral-event/claim
 * Memproses klaim koin referral setelah event 14 November 2026 selesai (Atomic Transaction)
 */
async function handleClaimReferralCoins(req, res) {
  const { traineeId } = req.body || {};

  if (!traineeId) {
    return res.status(400).json({ success: false, message: 'traineeId wajib disertakan.' });
  }

  try {
    await ensureMyByCoinTables();
    const { canClaim } = getEventDates();

    // 1. Cek apakah periode event sudah selesai (mulai 15 November 2026)
    if (!canClaim) {
      return res.status(400).json({
        success: false,
        message: 'Periode klaim koin referral baru dibuka pada 15 November 2026 setelah event selesai (14 November 2026 23:59 WIB).'
      });
    }

    const cleanId = String(traineeId).trim();
    const profile = await getTraineeProfile(cleanId);

    // 2. Cek apakah sudah pernah klaim sebelumnya (Proteksi 1x Seumur Hidup)
    const txCheck = await db.query(`
      SELECT id, amount, created_at 
      FROM myby_coin_transactions 
      WHERE (trainee_id = $1 OR LOWER(trainee_id) = LOWER($1))
        AND (badge = 'Referral Event Reward' OR title ILIKE '%referral event%' OR badge ILIKE '%referral event%')
      LIMIT 1
    `, [cleanId]);

    if (txCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        alreadyClaimed: true,
        message: 'Koin referral untuk event ini sudah pernah Anda klaim sebelumnya.'
      });
    }

    // 3. Hitung jumlah pendaftar referral
    const totalReferrals = await calculateTraineeReferrals(cleanId);
    if (totalReferrals <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda belum memiliki data teman yang berhasil diajak untuk diklaim.'
      });
    }

    const coinsToClaim = totalReferrals * REFERRAL_CONFIG.COIN_PER_REFERRAL;

    // 4. Eksekusi Atomic Transaction
    await db.query('BEGIN');

    // Update Saldo Wallet
    await db.query(`
      INSERT INTO myby_trainee_wallets ("ID", "Name", balance, total_earned)
      VALUES ($1, $2, $3, $3)
      ON CONFLICT ("ID")
      DO UPDATE SET
        balance = myby_trainee_wallets.balance + $3,
        total_earned = myby_trainee_wallets.total_earned + $3,
        "Name" = EXCLUDED."Name",
        updated_at = NOW()
    `, [profile.ID, profile.Name, coinsToClaim]);

    const wRes = await db.query('SELECT balance FROM myby_trainee_wallets WHERE "ID" = $1 LIMIT 1', [profile.ID]);
    const newBalance = wRes.rows[0] ? Number(wRes.rows[0].balance) : coinsToClaim;

    // Catat Riwayat Transaksi Resmi
    const txId = `tx-refevent-${Date.now()}`;
    await db.query(`
      INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge)
      VALUES ($1, $2, $3, $4, $5, 'earn', 'Referral Event Reward')
    `, [
      txId,
      profile.ID,
      profile.Name,
      `Klaim Hadiah Referral Event (${totalReferrals} Teman)`,
      coinsToClaim
    ]);

    await db.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Selamat! Berhasil mengklaim ${coinsToClaim} MYBY Coin dari hasil referral (${totalReferrals} teman).`,
      data: {
        coinsClaimed: coinsToClaim,
        totalReferrals,
        newBalance
      }
    });
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('[ReferralEvent] handleClaimReferralCoins error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal memproses klaim koin referral: ' + error.message });
  }
}

module.exports = {
  REFERRAL_CONFIG,
  getEventDates,
  handleGetReferralEventStatus,
  handleClaimReferralCoins
};
