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
    const { search, timeFilter, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT "ID", "Name", balance, total_earned, total_spent, created_at, updated_at FROM myby_trainee_wallets';
    const params = [];
    const conds = [];

    if (search) {
      params.push(`%${search}%`);
      conds.push(`("ID" ILIKE $${params.length} OR "Name" ILIKE $${params.length})`);
    }

    if (timeFilter === 'today') {
      conds.push(`DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))`);
    } else if (timeFilter === 'last_week') {
      conds.push(`created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    } else if (timeFilter === 'last_month') {
      conds.push(`created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(timeFilter)) {
      conds.push(`DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = '${timeFilter}'`);
    }

    if (conds.length) {
      query += ' WHERE ' + conds.join(' AND ');
    }

    query += ` ORDER BY balance DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));
    const result = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) AS count FROM myby_trainee_wallets';
    if (conds.length) {
      countQuery += ' WHERE ' + conds.join(' AND ');
    }
    const countRes = await db.query(countQuery, params.slice(0, conds.length ? (search ? 1 : 0) : 0));
    const countVal = countRes.rows && countRes.rows[0] ? (countRes.rows[0].count ?? countRes.rows[0]['COUNT(*)'] ?? 0) : 0;
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data wallet.', total: result.rows.length, grandTotal: Number(countVal), data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data wallet.', error: error.message });
  }
}

async function handleAdminGetWallet(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const result = await db.query(
      'SELECT "ID", "Name", balance, total_earned, total_spent, created_at, updated_at FROM myby_trainee_wallets WHERE "ID" = $1 LIMIT 1',
      [id]
    );
    if (result.rows.length === 0) {
      const traineeCheck = await db.query(
        'SELECT "ID", "Name" FROM credential_portal WHERE "ID" = $1 LIMIT 1',
        [id]
      );
      if (traineeCheck.rows.length > 0) {
        const tr = traineeCheck.rows[0];
        return res.status(200).json({
          success: true,
          data: {
            ID: tr.ID,
            Name: tr.Name,
            balance: 0,
            total_earned: 0,
            total_spent: 0,
            created_at: null,
            updated_at: null
          }
        });
      }
      return res.status(404).json({ success: false, message: `Wallet "${id}" tidak ditemukan.` });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil wallet.', error: error.message });
  }
}

// POST: buat/upsert wallet + adjust manual saldo (delta atau set absolut)
async function handleAdminUpsertWallet(req, res) {
  try {
    await ensureMyByCoinTables();
    const { ID, id, traineeId, Name, name, balance, total_earned, total_spent, adjust, title, admin_email } = req.body;
    const rawId = String(ID ?? id ?? traineeId ?? '').trim();
    if (!rawId) return res.status(400).json({ success: false, message: 'Field "ID" / traineeId wajib diisi.' });
    const profile = await getTraineeProfile(rawId);
    const finalName = String(Name ?? name ?? profile.Name ?? '').trim();

    const adminEmail = String(
      req.headers['x-admin-email'] ||
      admin_email ||
      req.body.admin_email ||
      req.body.adminEmail ||
      (req.adminUser ? req.adminUser.email : null) ||
      ''
    ).trim().toLowerCase();

    await db.query(
      `INSERT INTO myby_trainee_wallets ("ID", "Name", balance, total_earned, total_spent)
       VALUES ($1, $2, 0, 0, 0)
       ON CONFLICT ("ID") DO UPDATE SET "Name" = COALESCE(NULLIF(EXCLUDED."Name", ''), myby_trainee_wallets."Name")`,
      [profile.ID, finalName]
    );

    let result;
    if (balance !== undefined && balance !== null && balance !== '') {
      const existingWallet = (await db.query('SELECT balance FROM myby_trainee_wallets WHERE "ID" = $1 LIMIT 1', [profile.ID])).rows[0];
      const prevBalance = Number(existingWallet?.balance || 0);
      const targetBalance = Math.max(0, Number(balance));
      const delta = targetBalance - prevBalance;

      result = await db.query(
        `UPDATE myby_trainee_wallets SET
           balance = $2,
           total_earned = CASE WHEN $3 > 0 THEN total_earned + $3 ELSE total_earned END,
           total_spent = CASE WHEN $3 < 0 THEN total_spent + ABS($3) ELSE total_spent END,
           "Name" = CASE WHEN $4 != '' THEN $4 ELSE "Name" END,
           updated_at = NOW()
         WHERE "ID" = $1 RETURNING *`,
        [profile.ID, targetBalance, delta, finalName]
      );

      if (delta !== 0) {
        const customTitle = String(title || '').trim();
        const badge = delta > 0 ? 'Deposit Admin' : 'Koreksi Saldo';
        const defaultTitle = delta > 0 ? `Set Saldo Admin (+${delta})` : `Set Saldo Admin (${delta})`;
        const txTitle = customTitle || defaultTitle;
        await db.query(
          `INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge, admin_email, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `tx-adj-${Date.now()}`,
            profile.ID,
            finalName || profile.Name,
            txTitle,
            Math.abs(delta),
            delta > 0 ? 'earn' : 'spend',
            badge,
            adminEmail || null,
            JSON.stringify({
              by: adminEmail || 'admin',
              admin_email: adminEmail || null,
              set_balance: targetBalance,
              reason: customTitle
            })
          ]
        ).catch((err) => console.error('[CoinAdmin] Insert tx error:', err.message));
      }
    } else if (adjust !== undefined && adjust !== null && adjust !== '') {
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
      const customTitle = String(title || '').trim();
      const badge = delta >= 0 ? 'Deposit Admin' : 'Koreksi Saldo';
      const defaultTitle = delta >= 0 ? `Deposit Admin (+${delta})` : `Koreksi Saldo (${delta})`;
      const txTitle = customTitle || defaultTitle;
      await db.query(
        `INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge, admin_email, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `tx-adj-${Date.now()}`,
          profile.ID,
          finalName || profile.Name,
          txTitle,
          Math.abs(delta),
          delta >= 0 ? 'earn' : 'spend',
          badge,
          adminEmail || null,
          JSON.stringify({
            by: adminEmail || 'admin',
            admin_email: adminEmail || null,
            reason: customTitle
          })
        ]
      ).catch((err) => console.error('[CoinAdmin] Insert tx error:', err.message));
    } else {
      result = await db.query(
        `UPDATE myby_trainee_wallets SET
           total_earned = COALESCE($2, total_earned),
           total_spent = COALESCE($3, total_spent),
           "Name" = CASE WHEN $4 != '' THEN $4 ELSE "Name" END,
           updated_at = NOW()
         WHERE "ID" = $1 RETURNING *`,
        [profile.ID,
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
    const existing = await db.query('SELECT "ID", "Name" FROM myby_trainee_wallets WHERE "ID" = $1 LIMIT 1;', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, message: `Wallet "${id}" tidak ditemukan.` });
    await db.query('DELETE FROM myby_trainee_wallets WHERE "ID" = $1;', [id]);
    return res.status(200).json({ success: true, message: 'Wallet berhasil dihapus.', data: existing.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus wallet.', error: error.message });
  }
}

/* ---------------- TRANSACTIONS (manual audit) ---------------- */

async function handleAdminListTransactions(req, res) {
  try {
    await ensureMyByCoinTables();
    const { search, type, timeFilter, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT id, trainee_id AS "ID", "Name", title, amount, type, badge, admin_email, metadata, created_at FROM myby_coin_transactions';
    const params = [];
    const conds = [];
    if (search) {
      params.push(`%${search}%`);
      conds.push(`(trainee_id ILIKE $${params.length} OR "Name" ILIKE $${params.length} OR title ILIKE $${params.length} OR admin_email ILIKE $${params.length})`);
    }
    if (type) { params.push(type); conds.push(`type = $${params.length}`); }
    if (timeFilter === 'today') {
      conds.push(`DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))`);
    } else if (timeFilter === 'last_week') {
      conds.push(`created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    } else if (timeFilter === 'last_month') {
      conds.push(`created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(timeFilter)) {
      conds.push(`DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) = '${timeFilter}'`);
    }
    if (conds.length) query += ' WHERE ' + conds.join(' AND ');
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));
    const result = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) AS count FROM myby_coin_transactions';
    if (conds.length) countQuery += ' WHERE ' + conds.join(' AND ');
    const countRes = await db.query(countQuery, params.slice(0, conds.length ? (params.length - 2) : 0));
    const grandTotal = Number(countRes.rows[0]?.count ?? countRes.rows[0]?.['COUNT(*)'] ?? result.rows.length);

    const enrichedRows = result.rows.map(row => {
      let parsedMeta = {};
      try {
        parsedMeta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {});
      } catch (e) {}

      const resolvedAdminEmail = row.admin_email || parsedMeta.admin_email || (parsedMeta.by && parsedMeta.by.includes('@') ? parsedMeta.by : null);

      return {
        ...row,
        admin_email: resolvedAdminEmail,
        metadata: parsedMeta
      };
    });

    return res.status(200).json({ success: true, total: enrichedRows.length, grandTotal, data: enrichedRows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil transaksi.', error: error.message });
  }
}

async function handleAdminCreateTransaction(req, res) {
  try {
    await ensureMyByCoinTables();
    const { ID, id, traineeId, Name, name, title, amount, type = 'earn', badge = 'Admin Adjustment', metadata, admin_email } = req.body;
    const rawId = String(ID ?? id ?? traineeId ?? '').trim();
    if (!rawId || !title || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Field ID/traineeId, title, dan amount wajib diisi.' });
    }
    const profile = await getTraineeProfile(rawId);
    const finalName = String(Name ?? name ?? profile.Name ?? '').trim();
    const txId = `tx-adm-${Date.now()}`;

    const adminEmail = String(
      req.headers['x-admin-email'] ||
      admin_email ||
      req.body.admin_email ||
      req.body.adminEmail ||
      (req.adminUser ? req.adminUser.email : null) ||
      ''
    ).trim().toLowerCase();

    const metaObj = metadata && typeof metadata === 'object' ? { ...metadata } : {};
    if (adminEmail) metaObj.admin_email = adminEmail;

    const result = await db.query(
      `INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge, admin_email, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [txId, profile.ID, finalName, title, Number(amount), type, badge, adminEmail || null, JSON.stringify(metaObj)]
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
    query += " ORDER BY CASE WHEN tag = 'PROMO' THEN 0 ELSE 1 END, cost ASC";
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
    let baseWhere = '';
    const params = [];
    const conds = [];
    if (status) {
      params.push(status);
      conds.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conds.push(`(trainee_id ILIKE $${params.length} OR "Name" ILIKE $${params.length} OR reward_title ILIKE $${params.length} OR claim_code ILIKE $${params.length})`);
    }
    if (conds.length) baseWhere = ' WHERE ' + conds.join(' AND ');

    const countRes = await db.query('SELECT COUNT(*) as total FROM myby_redeem_requests' + baseWhere, params);
    const totalCount = Number(countRes.rows[0]?.total || 0);

    let query = 'SELECT *, trainee_id as "ID" FROM myby_redeem_requests' + baseWhere + ` ORDER BY COALESCE(scanned_at, updated_at, created_at) DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const dataRes = await db.query(query, [...params, Number(limit), Number(offset)]);
    return res.status(200).json({ success: true, total: totalCount, data: dataRes.rows });
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
    await db.query(
      'UPDATE myby_redeem_requests SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = NOW() WHERE id = $1',
      [id, status || null, notes !== undefined ? notes : null]
    );

    const traineeId = prev.trainee_id || prev.ID;

    // Jika admin mengubah status ke 'completed', set scanned_at otomatis jika belum ada
    if (status === 'completed' && !prev.scanned_at) {
      await db.query(
        "UPDATE myby_redeem_requests SET scanned_at = NOW(), scanned_by = COALESCE(scanned_by, 'Admin Portal') WHERE id = $1",
        [id]
      );
    }

    // refund jika berubah ke rejected dari status non-rejected
    if (status === 'rejected' && prev.status !== 'rejected') {
      await db.query(
        'UPDATE myby_trainee_wallets SET balance = balance + $2, total_spent = GREATEST(0, total_spent - $2), updated_at = NOW() WHERE "ID" = $1',
        [traineeId, Number(prev.coins_spent)]
      );
      await db.query(
        'UPDATE myby_rewards_catalog SET stock = stock + 1 WHERE id = $1',
        [prev.reward_id]
      ).catch(() => {});
      await db.query(
        `INSERT INTO myby_coin_transactions (id, trainee_id, "Name", title, amount, type, badge)
         VALUES ($1, $2, $3, $4, $5, 'earn', 'Refund Koin')`,
        [`tx-ref-${Date.now()}`, traineeId, prev.Name, `Refund: ${prev.reward_title}`, Number(prev.coins_spent)]
      );
    }
    await db.query('COMMIT');
    const returnData = (await db.query('SELECT * FROM myby_redeem_requests WHERE id = $1', [id])).rows[0];
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


// POST /redeems/scan { claim_code, scanned_by? } - CRO scans barcode: only this changes status to completed
async function handleScanRedeem(req, res) {
  const { claim_code, claimCode, code, scanned_by, scannedBy } = req.body || {};
  const rawCode = String(claim_code || claimCode || code || '').trim().toUpperCase();
  if (!rawCode) return res.status(400).json({ success: false, message: 'claim_code wajib diisi.' });
  const scanner = String(scanned_by || scannedBy || req.body?.cro_name || 'CRO SMLONE').trim();
  try {
    await ensureMyByCoinTables();
    let check = await db.query('SELECT * FROM myby_redeem_requests WHERE UPPER(claim_code) = $1 LIMIT 1', [rawCode]);
    if (check.rows.length === 0) {
      // Check in gift_claims if not yet in myby_redeem_requests
      const g = await db.query('SELECT * FROM gift_claims WHERE UPPER(claim_code) = $1 LIMIT 1', [rawCode]);
      if (g.rows.length > 0) {
        const giftClaim = g.rows[0];
        const prof = (await db.query('SELECT `Name` FROM profile_trainee WHERE `ID` = ? LIMIT 1', [giftClaim.user_id])).rows[0];
        const tName = prof ? prof.Name : 'Trainee';
        const redId = 'red-' + giftClaim.id;
        await db.query(
          `INSERT INTO myby_redeem_requests (id, trainee_id, \`Name\`, reward_id, reward_title, coins_spent, status, claim_code, created_at, scanned_at, scanned_by)
           VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, NOW(), ?)`,
          [redId, giftClaim.user_id, tName, giftClaim.gift_id, giftClaim.gift_name, giftClaim.coin_cost, giftClaim.claim_code, giftClaim.created_at, scanner]
        );
        await db.query("UPDATE gift_claims SET status = 'completed', scanned_at = NOW() WHERE UPPER(claim_code) = ?", [rawCode]);
        const newRecord = (await db.query('SELECT * FROM myby_redeem_requests WHERE id = ?', [redId])).rows[0];
        return res.status(200).json({
          success: true,
          message: `Klaim berhasil diverifikasi dan diserahkan ke ${tName} (${giftClaim.gift_name}). Status kini: Sudah Diambil.`,
          data: newRecord
        });
      }
      return res.status(404).json({ success: false, message: 'Kode klaim voucher tidak ditemukan.' });
    }
    const row = check.rows[0];
    if (row.status === 'completed' || row.scanned_at) {
      const scanDate = row.scanned_at ? new Date(row.scanned_at).toLocaleString('id-ID') : 'sebelumnya';
      return res.status(409).json({
        success: false,
        message: `Kupon barcode ini SUDAH PERNAH DIGUNAKAN (Hadiah sudah diambil pada ${scanDate}).`,
        data: row
      });
    }
    await db.query("UPDATE myby_redeem_requests SET status='completed', scanned_at=NOW(), scanned_by=$2, updated_at=NOW() WHERE id=$1", [row.id, scanner]);
    try { await db.query("UPDATE gift_claims SET status='completed', scanned_at=NOW() WHERE UPPER(claim_code)=$1", [rawCode]); } catch(_){}
    const updated = (await db.query('SELECT * FROM myby_redeem_requests WHERE id=$1', [row.id])).rows[0];
    return res.status(200).json({
      success: true,
      message: `Klaim berhasil diverifikasi dan diserahkan ke ${updated.Name || updated.trainee_id} (${updated.reward_title}). Status kini: Sudah Diambil.`,
      data: updated
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Gagal scan barcode.', error: e.message });
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
  handleAdminDeleteRedeem,
  handleScanRedeem
};
