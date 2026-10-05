/**
 * ============================================================
 * MYBY COIN - WALLET / TRANSACTION / REWARD / REDEEM ADMIN CRUD
 * ============================================================
 * CRUD admin untuk:
 *  - myby_trainee_wallets (dompet koin)
 *  - myby_coin_transactions (mutasi manual)
 *  - myby_rewards_catalog (katalog reward)
 *  - myby_redeem_requests (status pengajuan redeem)
 * ============================================================
 */

const db = require('../../../db/neonClient');
const { ensureMyByCoinTables, getTraineeProfile } = require('../mybyCoinDatabase');

/* ---------------- WALLETS ---------------- */

async function handleAdminListWallets(req, res) {
  try {
    await ensureMyByCoinTables();
    const { search, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT "ID", "Name", balance, total_earned, total_spent, created_at, updated_at FROM myby_trainee_wallets';
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ' WHERE "ID" ILIKE $1 OR "Name" ILIKE $1';
    }
    query += ` ORDER BY balance DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));
    const result = await db.query(query, params);
    const countRes = await db.query('SELECT COUNT(*) FROM myby_trainee_wallets');
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data wallet.', total: result.rows.length, grandTotal: Number(countRes.rows[0].count), data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data wallet.', error: error.message });
  }
}

async function handleAdminGetWallet(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const result = await db.query(
      'SELECT "ID", "Name", balance, total_earned, total_spent, created_at, updated_at FROM myby_trainee_wallets WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 OR "Name" ILIKE $1 LIMIT 1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: `Wallet "${id}" tidak ditemukan.` });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil wallet.', error: error.message });
  }
}

// POST: buat/upsert wallet + adjust manual saldo (delta atau set absolut)
async function handleAdminUpsertWallet(req, res) {
  try {
    await ensureMyByCoinTables();
    const { ID, id, traineeId, Name, name, balance, total_earned, total_spent, adjust } = req.body;
    const rawId = String(ID ?? id ?? traineeId ?? '').trim();
    if (!rawId) return res.status(400).json({ success: false, message: 'Field "ID" / traineeId wajib diisi.' });
    const profile = await getTraineeProfile(rawId);
    const finalName = String(Name ?? name ?? profile.Name ?? '').trim();

    await db.query(
      `INSERT INTO myby_trainee_wallets ("ID", "Name", balance, total_earned, total_spent)
       VALUES ($1, $2, 0, 0, 0)
       ON CONFLICT ("ID") DO UPDATE SET "Name" = COALESCE(NULLIF(EXCLUDED."Name", ''), myby_trainee_wallets."Name")`,
      [profile.ID, finalName]
    );

    let result;
    if (adjust !== undefined && adjust !== null && adjust !== '') {
      const delta = Number(adjust);
      result = await db.query(
        `UPDATE myby_trainee_wallets SET
           balance = GREATEST(0, balance + $2),
           total_earned = CASE WHEN $2 > 0 THEN total_earned + $2 ELSE total_earned END,
           total_spent = CASE WHEN $2 < 0 THEN total_spent + ABS($2) ELSE total_spent END,
           "Name" = CASE WHEN $3 != '' THEN $3 ELSE "Name" END,
           updated_at = NOW()
         WHERE "ID" = $1 RETURNING *`,
        [profile.ID, delta, finalName]
      );
      // catat mutasi audit admin: badge "Deposit Admin" (+) atau "Koreksi Saldo" (-)
      const badge = delta >= 0 ? 'Deposit Admin' : 'Koreksi Saldo';
      const txTitle = delta >= 0 ? `Deposit Admin (+${delta})` : `Koreksi Saldo (${delta})`;
      await db.query(
        `INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [`tx-adj-${Date.now()}`, profile.ID, finalName || profile.Name, txTitle, Math.abs(delta), delta >= 0 ? 'earn' : 'spend', badge, JSON.stringify({ by: 'admin' })]
      ).catch(() => {});
    } else {
      result = await db.query(
        `UPDATE myby_trainee_wallets SET
           balance = COALESCE($2, balance),
           total_earned = COALESCE($3, total_earned),
           total_spent = COALESCE($4, total_spent),
           "Name" = CASE WHEN $5 != '' THEN $5 ELSE "Name" END,
           updated_at = NOW()
         WHERE "ID" = $1 RETURNING *`,
        [profile.ID,
          balance !== undefined ? Number(balance) : null,
          total_earned !== undefined ? Number(total_earned) : null,
          total_spent !== undefined ? Number(total_spent) : null,
          finalName]
      );
    }
    const returnData = (await db.query('SELECT * FROM myby_trainee_wallets WHERE "ID" = $1', [profile.ID])).rows[0] || result.rows[0];
    return res.status(201).json({ success: true, message: 'Deposit / saldo berhasil diperbarui.', data: returnData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menyimpan wallet.', error: error.message });
  }
}

async function handleAdminDeleteWallet(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const existing = await db.query('SELECT "ID", "Name" FROM myby_trainee_wallets WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 LIMIT 1;', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, message: `Wallet "${id}" tidak ditemukan.` });
    await db.query('DELETE FROM myby_trainee_wallets WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1;', [id]);
    return res.status(200).json({ success: true, message: 'Wallet berhasil dihapus.', data: existing.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus wallet.', error: error.message });
  }
}

/* ---------------- TRANSACTIONS (manual audit) ---------------- */

async function handleAdminListTransactions(req, res) {
  try {
    await ensureMyByCoinTables();
    const { search, type, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT id, trainee_id AS "ID", "Name", title, amount, type, badge, metadata, created_at FROM myby_coin_transactions';
    const params = [];
    const conds = [];
    if (search) { params.push(`%${search}%`); conds.push(`(trainee_id ILIKE $${params.length} OR "Name" ILIKE $${params.length} OR title ILIKE $${params.length})`); }
    if (type) { params.push(type); conds.push(`type = $${params.length}`); }
    if (conds.length) query += ' WHERE ' + conds.join(' AND ');
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));
    const result = await db.query(query, params);
    return res.status(200).json({ success: true, total: result.rows.length, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil transaksi.', error: error.message });
  }
}

async function handleAdminCreateTransaction(req, res) {
  try {
    await ensureMyByCoinTables();
    const { ID, id, traineeId, Name, name, title, amount, type = 'earn', badge = 'Admin Adjustment', metadata } = req.body;
    const rawId = String(ID ?? id ?? traineeId ?? '').trim();
    if (!rawId || !title || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Field ID/traineeId, title, dan amount wajib diisi.' });
    }
    const profile = await getTraineeProfile(rawId);
    const finalName = String(Name ?? name ?? profile.Name ?? '').trim();
    const txId = `tx-adm-${Date.now()}`;
    const result = await db.query(
      `INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [txId, profile.ID, finalName, title, Number(amount), type, badge, metadata ? JSON.stringify(metadata) : '{}']
    );
    return res.status(201).json({ success: true, message: 'Transaksi manual berhasil dicatat.', data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mencatat transaksi.', error: error.message });
  }
}

async function handleAdminDeleteTransaction(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const existing = await db.query('SELECT id FROM myby_coin_transactions WHERE id = $1 LIMIT 1;', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, message: `Transaksi "${id}" tidak ditemukan.` });
    await db.query('DELETE FROM myby_coin_transactions WHERE id = $1;', [id]);
    return res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus.', data: existing.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus transaksi.', error: error.message });
  }
}

/* ---------------- REWARDS CATALOG ---------------- */

async function handleAdminListRewards(req, res) {
  try {
    await ensureMyByCoinTables();
    const { includeInactive } = req.query;
    let query = 'SELECT * FROM myby_rewards_catalog';
    if (!includeInactive || includeInactive === 'false') query += ' WHERE is_active = TRUE';
    query += ' ORDER BY cost ASC';
    const result = await db.query(query);
    return res.status(200).json({ success: true, total: result.rows.length, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil katalog.', error: error.message });
  }
}

async function handleAdminGetReward(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const result = await db.query('SELECT * FROM myby_rewards_catalog WHERE id = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: `Reward "${id}" tidak ditemukan.` });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil reward.', error: error.message });
  }
}

async function handleAdminUpsertReward(req, res) {
  try {
    await ensureMyByCoinTables();
    const { id, title, category, cost, stock, image_url, image, tag, description, is_active } = req.body;
    if (!title || !category || cost === undefined) {
      return res.status(400).json({ success: false, message: 'Field title, category, dan cost wajib diisi.' });
    }
    const finalId = String(id || `rwd-${Date.now()}`).trim();
    const result = await db.query(`
      INSERT INTO myby_rewards_catalog (id, title, category, cost, stock, image_url, tag, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, category = EXCLUDED.category, cost = EXCLUDED.cost,
        stock = EXCLUDED.stock, image_url = EXCLUDED.image_url, tag = EXCLUDED.tag,
        description = EXCLUDED.description, is_active = EXCLUDED.is_active
      RETURNING *;
    `, [finalId, title, category, Number(cost), Number(stock ?? 0), image_url ?? image ?? null, tag ?? null, description ?? null, is_active !== undefined ? Boolean(is_active) : true]);
    const returnData = (await db.query('SELECT * FROM myby_rewards_catalog WHERE id = $1', [finalId])).rows[0] || result.rows[0];
    return res.status(201).json({ success: true, message: 'Reward berhasil disimpan.', data: returnData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menyimpan reward.', error: error.message });
  }
}

async function handleAdminUpdateReward(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const check = await db.query('SELECT * FROM myby_rewards_catalog WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: `Reward "${id}" tidak ditemukan.` });
    const ex = check.rows[0];
    const b = req.body;
    const result = await db.query(`
      UPDATE myby_rewards_catalog SET
        title = $2, category = $3, cost = $4, stock = $5, image_url = $6,
        tag = $7, description = $8, is_active = $9
      WHERE id = $1 RETURNING *;
    `, [id,
      b.title ?? ex.title, b.category ?? ex.category,
      b.cost !== undefined ? Number(b.cost) : ex.cost,
      b.stock !== undefined ? Number(b.stock) : ex.stock,
      b.image_url ?? b.image ?? ex.image_url,
      b.tag !== undefined ? b.tag : ex.tag,
      b.description !== undefined ? b.description : ex.description,
      b.is_active !== undefined ? Boolean(b.is_active) : ex.is_active]);
    const returnData = (await db.query('SELECT * FROM myby_rewards_catalog WHERE id = $1', [id])).rows[0] || result.rows[0];
    return res.status(200).json({ success: true, message: 'Reward berhasil diperbarui.', data: returnData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui reward.', error: error.message });
  }
}

async function handleAdminDeleteReward(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const existing = await db.query('SELECT id, title FROM myby_rewards_catalog WHERE id = $1 LIMIT 1;', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, message: `Reward "${id}" tidak ditemukan.` });
    await db.query('DELETE FROM myby_rewards_catalog WHERE id = $1;', [id]);
    return res.status(200).json({ success: true, message: 'Reward berhasil dihapus.', data: existing.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus reward.', error: error.message });
  }
}

/* ---------------- REDEEM REQUESTS ---------------- */

async function handleAdminListRedeems(req, res) {
  try {
    await ensureMyByCoinTables();
    const { status, search, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM myby_redeem_requests';
    const params = [];
    const conds = [];
    if (status) { params.push(status); conds.push(`status = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conds.push(`("ID" ILIKE $${params.length} OR "Name" ILIKE $${params.length} OR reward_title ILIKE $${params.length})`); }
    if (conds.length) query += ' WHERE ' + conds.join(' AND ');
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));
    const result = await db.query(query, params);
    return res.status(200).json({ success: true, total: result.rows.length, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil redeem.', error: error.message });
  }
}

async function handleAdminGetRedeem(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const result = await db.query('SELECT * FROM myby_redeem_requests WHERE id = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: `Redeem "${id}" tidak ditemukan.` });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil redeem.', error: error.message });
  }
}

// PUT: update status redeem (pending/approved/rejected/completed) + refund otomatis jika rejected
async function handleAdminUpdateRedeem(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    let { status, notes } = req.body;
    if (status) status = String(status).toLowerCase().trim();
    const allowed = ['pending', 'approved', 'rejected', 'completed'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status harus salah satu: ${allowed.join(', ')}` });
    }
    const check = await db.query('SELECT * FROM myby_redeem_requests WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: `Redeem "${id}" tidak ditemukan.` });
    const prev = check.rows[0];

    await db.query('BEGIN');
    const result = await db.query(
      'UPDATE myby_redeem_requests SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, status || null, notes !== undefined ? notes : null]
    );

    // refund jika berubah ke rejected dari status non-rejected
    if (status === 'rejected' && prev.status !== 'rejected') {
      await db.query(
        'UPDATE myby_trainee_wallets SET balance = balance + $2, total_spent = GREATEST(0, total_spent - $2), updated_at = NOW() WHERE "ID" = $1 OR LOWER("ID") = LOWER($1)',
        [prev.ID, Number(prev.coins_spent)]
      );
      await db.query(
        'UPDATE myby_rewards_catalog SET stock = stock + 1 WHERE id = $1',
        [prev.reward_id]
      ).catch(() => {});
      await db.query(
        `INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge)
         VALUES ($1, $2, $3, $4, $5, 'earn', 'Refund Koin')`,
        [`tx-ref-${Date.now()}`, prev.ID, prev.Name, `Refund: ${prev.reward_title}`, Number(prev.coins_spent)]
      );
    }
    await db.query('COMMIT');
    const returnData = (await db.query('SELECT * FROM myby_redeem_requests WHERE id = $1', [id])).rows[0] || result.rows[0];
    return res.status(200).json({ success: true, message: 'Status klaim hadiah berhasil diperbarui.', data: returnData });
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    return res.status(500).json({ success: false, message: 'Gagal memperbarui redeem.', error: error.message });
  }
}

async function handleAdminDeleteRedeem(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const existing = await db.query('SELECT id FROM myby_redeem_requests WHERE id = $1 LIMIT 1;', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, message: `Redeem "${id}" tidak ditemukan.` });
    await db.query('DELETE FROM myby_redeem_requests WHERE id = $1;', [id]);
    return res.status(200).json({ success: true, message: 'Redeem berhasil dihapus.', data: existing.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus redeem.', error: error.message });
  }
}

module.exports = {
  handleAdminListWallets,
  handleAdminGetWallet,
  handleAdminUpsertWallet,
  handleAdminDeleteWallet,
  handleAdminListTransactions,
  handleAdminCreateTransaction,
  handleAdminDeleteTransaction,
  handleAdminListRewards,
  handleAdminGetReward,
  handleAdminUpsertReward,
  handleAdminUpdateReward,
  handleAdminDeleteReward,
  handleAdminListRedeems,
  handleAdminGetRedeem,
  handleAdminUpdateRedeem,
  handleAdminDeleteRedeem
};
