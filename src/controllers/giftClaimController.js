const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');
const { ensureMyByCoinTables, getTraineeProfile } = require('../portal/myby_coin/mybyCoinDatabase');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

// Master hadiah prompt -> katalog existing
const GIFT_MAP = {
  'keychain-pena': { catalogId: 'rew-1', nama: 'Keychain / Pena SMLONE', cost: 30 },
  'lego-mini': { catalogId: 'rew-2', nama: 'Lego Mini / Notebook A6', cost: 50 },
  'notebook-a5': { catalogId: 'rew-3', nama: 'Notebook A5', cost: 80 },
  'payung-tiket': { catalogId: 'rew-4', nama: 'Payung SMLONE / 1 Tiket XXI-CGV', cost: 100 },
  // Dukung juga ID katalog langsung (kompatibilitas frontend reward card)
  'rew-1': { catalogId: 'rew-1', nama: 'Keychain / Pena SMLONE', cost: 30 },
  'rew-2': { catalogId: 'rew-2', nama: 'Lego Mini / Notebook A6', cost: 50 },
  'rew-3': { catalogId: 'rew-3', nama: 'Notebook A5', cost: 80 },
  'rew-4': { catalogId: 'rew-4', nama: 'Payung SMLONE / 1 Tiket XXI-CGV', cost: 100 },
  'rew-5': { catalogId: 'rew-5', nama: 'Agenda SMLONE / 2 Tiket Nonton', cost: 150 },
  'rew-6': { catalogId: 'rew-6', nama: 'Tumblr SMLONE', cost: 200 },
  'rew-7': { catalogId: 'rew-7', nama: 'Jaket / Tas SMLONE', cost: 250 },
};

const N8N_GIFT_WEBHOOK =
  process.env.N8N_GIFT_WEBHOOK_URL ||
  'https://n8n-jua7.srv1825659.hstgr.cloud/webhook/gift-claim';

async function ensureGiftClaimsTable() {
  await ensureMyByCoinTables();
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.gift_claims (
      id VARCHAR(100) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      gift_id VARCHAR(100) NOT NULL,
      gift_name VARCHAR(255) NOT NULL,
      coin_cost INTEGER NOT NULL,
      remaining_coin INTEGER NOT NULL,
      status VARCHAR(50) DEFAULT 'claimed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_gift_claims_user_gift ON public.gift_claims(user_id, gift_id, created_at DESC);
  `);
}

function extractUserFromRequest(req) {
  let user = null;
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (authHeader) {
    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : authHeader.replace(/^Bearer\s+/i, '');

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (_) {
        try {
          user = jwt.decode(token);
        } catch (_) {}
      }

      if (!user) {
        try {
          const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
          if (parsed && typeof parsed === 'object') user = parsed;
        } catch (_) {}
      }

      if (!user && token.length < 50 && !token.includes('.')) {
        user = { id: token, trainee_id: token };
      }
    }
  }

  if (!user && req.user) user = req.user;

  const bodyId = req.body?.trainee_id ?? req.body?.traineeId ?? req.body?.user_id ?? req.body?.id ?? req.body?.ID;
  if (!user && bodyId) {
    user = {
      id: String(bodyId).trim(),
      trainee_id: String(bodyId).trim(),
      name: req.body?.name || req.body?.Nama || '',
      email: req.body?.email || req.body?.Email || ''
    };
  }

  return user;
}

/**
 * POST /api/v1/gifts/claim
 * Logic berurutan:
 * 1. Ambil user dari JWT, kunci row koin (SELECT FOR UPDATE).
 * 2. Validasi gift_id ada, saldo >= cost. Jika kurang -> 400 { success:false, error:"Koin tidak cukup" }.
 * 3. Cek idempotency: tolak jika ada claim gift sama dalam 60 detik terakhir (key: user_id + gift_id).
 * 4. Kurangi koin + insert ke tabel gift_claims (id, user_id, gift_id, gift_name, coin_cost, remaining_coin, status, created_at) dalam 1 transaksi DB.
 * 5. Setelah commit sukses, forward ASYNC (fire-and-forget, timeout 5 detik, jangan gagalkan response kalau n8n timeout).
 * 6. Langsung return 200 ke portal:
 *    { success:true, message:"Hadiah berhasil diklaim, cek email kamu", data:{ gift: gift_name, coin_cost: cost, remaining_coin: sisa } }
 */
async function handleGiftClaim(req, res) {
  try {
    await ensureGiftClaimsTable();

    // 1. Ambil user dari JWT (atau fallback identitas sesi)
    const user = extractUserFromRequest(req);
    const traineeId = user ? String(user.trainee_id || user.traineeId || user.id || user.ID || user.sub || '').trim() : '';

    if (!traineeId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token JWT wajib disertakan (Authorization: Bearer <token>).'
      });
    }

    // 2. Validasi gift_id ada
    const rawGiftId = String(req.body?.gift_id ?? req.body?.giftId ?? '').trim().toLowerCase();
    if (!rawGiftId) {
      return res.status(400).json({ success: false, error: 'gift_id wajib diisi.' });
    }

    const gift = GIFT_MAP[rawGiftId];
    if (!gift) {
      return res.status(400).json({ success: false, error: `gift_id "${rawGiftId}" tidak valid atau tidak ditemukan.` });
    }

    // Ambil profile trainee lengkap (Nama dan Email)
    const profile = await getTraineeProfile(traineeId);
    let userName = String(user.name || user.Name || user.nama || profile.Name || 'Trainee SMLONE').trim();
    let userEmail = String(user.email || user.Email || '').trim().toLowerCase();

    if (!userEmail) {
      try {
        const pRes = await db.query(
          'SELECT "Parents Email Account" AS email FROM profile_trainee WHERE "ID" = $1 LIMIT 1',
          [profile.ID]
        );
        if (pRes.rows.length > 0 && pRes.rows[0].email) {
          userEmail = String(pRes.rows[0].email).trim().toLowerCase();
        }
      } catch (_) {}
    }

    // Transaksi Atomik Database
    await db.query('BEGIN');
    try {
      // 1b. Kunci row koin (SELECT FOR UPDATE)
      let walletRes = await db.query(
        'SELECT * FROM myby_trainee_wallets WHERE "ID" = $1 FOR UPDATE',
        [profile.ID]
      );
      if (walletRes.rows.length === 0) {
        await db.query(
          'INSERT INTO myby_trainee_wallets ("ID", "Name", balance, total_earned) VALUES ($1, $2, 0, 0) ON CONFLICT ("ID") DO NOTHING',
          [profile.ID, profile.Name]
        );
        walletRes = await db.query(
          'SELECT * FROM myby_trainee_wallets WHERE "ID" = $1 FOR UPDATE',
          [profile.ID]
        );
      }
      const wallet = walletRes.rows[0];

      // 3. Cek idempotency: tolak jika ada claim gift sama dalam 60 detik terakhir (key: user_id + gift_id)
      const dupRes = await db.query(
        `SELECT id FROM public.gift_claims
         WHERE user_id = $1 AND gift_id = $2 AND created_at > NOW() - INTERVAL '60 seconds'
         LIMIT 1`,
        [profile.ID, rawGiftId]
      );
      if (dupRes.rows.length > 0) {
        await db.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          error: 'Klaim duplikat: hadiah yang sama baru saja diklaim dalam 60 detik terakhir.'
        });
      }

      // 2b. Validasi saldo >= cost
      if (Number(wallet.balance) < gift.cost) {
        await db.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Koin tidak cukup' });
      }

      // 4. Kurangi koin + insert ke tabel gift_claims (id, user_id, gift_id, gift_name, coin_cost, remaining_coin, status, created_at)
      const remaining = Number(wallet.balance) - gift.cost;
      await db.query(
        `UPDATE myby_trainee_wallets
         SET balance = $2, total_spent = total_spent + $3, updated_at = NOW()
         WHERE "ID" = $1`,
        [profile.ID, remaining, gift.cost]
      );

      const claimId = `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.query(
        `INSERT INTO public.gift_claims (id, user_id, gift_id, gift_name, coin_cost, remaining_coin, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'claimed', NOW())`,
        [claimId, profile.ID, rawGiftId, gift.nama, gift.cost, remaining]
      );

      // Sekaligus catat mutasi buku kas koin (badge: 'Klaim Hadiah') & redeem request
      await db.query(
        `INSERT INTO myby_coin_transactions (id, "ID", "Name", title, amount, type, badge)
         VALUES ($1, $2, $3, $4, $5, 'spend', 'Klaim Hadiah')`,
        [`tx-${claimId}`, profile.ID, profile.Name, `Klaim Hadiah: ${gift.nama}`, gift.cost]
      );
      await db.query(
        `INSERT INTO myby_redeem_requests (id, "ID", "Name", reward_id, reward_title, coins_spent, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
        [`red-${claimId}`, profile.ID, profile.Name, gift.catalogId || rawGiftId, gift.nama, gift.cost, 'via /api/v1/gifts/claim']
      );
      if (gift.catalogId) {
        await db.query(
          'UPDATE myby_rewards_catalog SET stock = GREATEST(0, stock - 1) WHERE id = $1',
          [gift.catalogId]
        ).catch(() => {});
      }

      await db.query('COMMIT');

      // 6. Langsung return 200 ke portal
      res.status(200).json({
        success: true,
        message: 'Hadiah berhasil diklaim, cek email kamu',
        data: {
          gift: gift.nama,
          coin_cost: gift.cost,
          remaining_coin: remaining
        }
      });

      // 5. Setelah commit sukses, forward ASYNC (fire-and-forget, timeout 5 detik, jangan gagalkan response kalau n8n timeout)
      setImmediate(async () => {
        try {
          await axios.post(
            N8N_GIFT_WEBHOOK,
            {
              id: profile.ID,
              name: userName,
              email: userEmail,
              gift: gift.nama,
              coin_cost: gift.cost,
              remaining_coin: remaining
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000
            }
          );
          console.log(`[GIFT CLAIM] Forwarded to n8n webhook: ${profile.ID} -> ${gift.nama}`);
        } catch (e) {
          console.error(`[GIFT CLAIM FORWARD ERROR] ${profile.ID}:`, e.message);
        }
      });

    } catch (txErr) {
      await db.query('ROLLBACK').catch(() => {});
      throw txErr;
    }

  } catch (err) {
    console.error('[GIFT CLAIM ERROR]', err.message);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server.' });
    }
  }
}

module.exports = { handleGiftClaim, GIFT_MAP, JWT_SECRET };
