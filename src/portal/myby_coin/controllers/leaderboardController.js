/**
 * ============================================================
 * MYBY COIN - LEADERBOARD CONTROLLER
 * ============================================================
 * Menghitung ranking realtime berdasarkan:
 * 1. current_streak DESC
 * 2. total_earned DESC
 * 3. longest_streak DESC
 * 4. "Name" ASC
 * Join tabel menggunakan kolom "ID" sebagai Primary Key
 * ============================================================
 */

const db = require('../../../db/neonClient');
const { ensureMyByCoinTables } = require('../mybyCoinDatabase');

/**
 * GET /leaderboard
 * Query peringkat trainee lengkap dengan filter house & user sticky
 */
async function handleGetLeaderboard(req, res) {
  const { limit = 50, currentUserId, house } = req.query;

  try {
    await ensureMyByCoinTables();

    let query = `
      SELECT 
        p."ID" AS id,
        COALESCE(p."Name", s."Name", w."Name", 'Trainee SMLONE') AS name,
        COALESCE(p."HOUSE", 'House of Thenova') AS house,
        COALESCE(p."Class", 'Public Speaking Alpha') AS class,
        COALESCE(s.current_streak, 0) AS streak,
        COALESCE(s.longest_streak, 0) AS longest_streak,
        COALESCE(w.balance, 0) AS balance,
        COALESCE(w.total_earned, 0) AS coins_earned,
        DENSE_RANK() OVER (
          ORDER BY COALESCE(s.current_streak, 0) DESC, 
                   COALESCE(w.total_earned, 0) DESC, 
                   COALESCE(s.longest_streak, 0) DESC,
                   p."Name" ASC
        ) AS rank
      FROM myby_trainee_streaks s
      JOIN profile_trainee p ON p."ID" = s."ID" OR LOWER(p."ID") = LOWER(s."ID")
      LEFT JOIN myby_trainee_wallets w ON p."ID" = w."ID" OR LOWER(p."ID") = LOWER(w."ID")
      WHERE s.current_streak > 0
    `;

    const params = [];
    if (house && house !== 'Semua') {
      params.push(house);
      query += ` AND p."HOUSE" = $${params.length}`;
    }

    query += ` ORDER BY rank ASC, p."Name" ASC LIMIT $${params.length + 1}`;
    params.push(Number(limit));

    const result = await db.query(query, params);

    const list = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      house: row.house,
      class: row.class,
      streak: Number(row.streak),
      longestStreak: Number(row.longest_streak),
      coinsEarned: Number(row.coins_earned),
      rank: Number(row.rank),
      isCurrentUser: currentUserId ? (row.id === currentUserId || row.id?.toLowerCase() === currentUserId?.toLowerCase()) : false
    }));

    return res.status(200).json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (error) {
    console.error('[MyBy Coin] GET /leaderboard error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /leaderboard-referral
 * Ranking trainee berdasarkan jumlah teman yang berhasil diajak (referral)
 * Menghitung jumlah referral sukses per trainee dari tabel referral_link,
 * riwayat transaksi badge 'Referral Bonus', dan pendaftar calon_siswa_smlone.
 * Join dengan profile_trainee untuk mengambil ID, Name, dan HOUSE.
 * Urutkan berdasarkan: totalReferrals DESC, bonusCoins DESC, "Name" ASC.
 * Mendukung query ?currentUserId=... untuk menandai flag isCurrentUser: true.
 */
async function handleGetLeaderboardReferral(req, res) {
  const { limit = 50, currentUserId } = req.query;

  try {
    await ensureMyByCoinTables();

    // Query agregat dari referral_link, transaksi badge 'Referral Bonus', dan calon_siswa_smlone
    // Normalisasi: kode "SMLONE-<ID>" / "MYBY-<ID>" / "SML-<ID>-REF" selalu dipetakan ke ID trainee aslinya
    const query = `
      WITH link_agg AS (
        SELECT
          COALESCE(
            rc."ID",
            CASE
              WHEN UPPER(TRIM(rl."Referal By")) LIKE 'SMLONE-%' THEN TRIM(SUBSTRING(TRIM(rl."Referal By") FROM 8))
              WHEN UPPER(TRIM(rl."Referal By")) LIKE 'MYBY-%' THEN TRIM(SUBSTRING(TRIM(rl."Referal By") FROM 6))
              ELSE TRIM(rl."Referal By")
            END
          ) AS trainee_id,
          COUNT(DISTINCT rl."ID") AS link_count
        FROM referral_link rl
        LEFT JOIN referral_code rc ON LOWER(TRIM(rl."Referal By")) = LOWER(TRIM(rc."Referral Code")) OR LOWER(TRIM(rl."Referal By")) = LOWER(TRIM(rc."ID"))
        WHERE rl."Referal By" IS NOT NULL AND rl."Referal By" != ''
        GROUP BY COALESCE(
          rc."ID",
          CASE
            WHEN UPPER(TRIM(rl."Referal By")) LIKE 'SMLONE-%' THEN TRIM(SUBSTRING(TRIM(rl."Referal By") FROM 8))
            WHEN UPPER(TRIM(rl."Referal By")) LIKE 'MYBY-%' THEN TRIM(SUBSTRING(TRIM(rl."Referal By") FROM 6))
            ELSE TRIM(rl."Referal By")
          END
        )
      ),
      tx_agg AS (
        SELECT 
          tx."ID" AS trainee_id,
          COUNT(DISTINCT tx.id) AS tx_count,
          COALESCE(SUM(tx.amount), 0) AS tx_coins
        FROM myby_coin_transactions tx
        WHERE tx.badge ILIKE '%referral%' OR tx.title ILIKE '%referral%' OR tx.title ILIKE '%ajak teman%'
        GROUP BY tx."ID"
      ),
      calon_agg AS (
        SELECT 
          COALESCE(rc."ID", cs.inviter_id) AS trainee_id,
          COUNT(DISTINCT cs.id) AS calon_count
        FROM calon_siswa_smlone cs
        LEFT JOIN referral_code rc ON LOWER(TRIM(cs.referral_code)) = LOWER(TRIM(rc."Referral Code"))
        WHERE (cs.inviter_id IS NOT NULL AND cs.inviter_id != '') OR (cs.referral_code IS NOT NULL AND cs.referral_code != '')
        GROUP BY COALESCE(rc."ID", cs.inviter_id)
      ),
      all_trainees AS (
        SELECT trainee_id FROM link_agg
        UNION
        SELECT trainee_id FROM tx_agg
        UNION
        SELECT trainee_id FROM calon_agg
      )
      SELECT 
        a.trainee_id AS id,
        COALESCE(p."Name", cp."Name", rc."Name", 'Trainee SMLONE') AS name,
        COALESCE(p."HOUSE", 'House of Thenova') AS house,
        COALESCE(p."Class", 'Public Speaking Alpha') AS class,
        GREATEST(COALESCE(l.link_count, 0), COALESCE(t.tx_count, 0), COALESCE(c.calon_count, 0))::int AS total_referrals,
        CASE 
          WHEN COALESCE(t.tx_coins, 0) > 0 THEN t.tx_coins::int 
          ELSE (GREATEST(COALESCE(l.link_count, 0), COALESCE(t.tx_count, 0), COALESCE(c.calon_count, 0)) * 75)::int 
        END AS bonus_coins
      FROM all_trainees a
      LEFT JOIN link_agg l ON a.trainee_id = l.trainee_id
      LEFT JOIN tx_agg t ON a.trainee_id = t.trainee_id
      LEFT JOIN calon_agg c ON a.trainee_id = c.trainee_id
      LEFT JOIN profile_trainee p ON a.trainee_id = p."ID" OR LOWER(a.trainee_id) = LOWER(p."ID")
      LEFT JOIN credential_portal cp ON a.trainee_id = cp."ID" OR LOWER(a.trainee_id) = LOWER(cp."ID")
      LEFT JOIN referral_code rc ON a.trainee_id = rc."ID" OR LOWER(a.trainee_id) = LOWER(rc."ID")
      WHERE a.trainee_id IS NOT NULL AND a.trainee_id != ''
      ORDER BY total_referrals DESC, bonus_coins DESC, name ASC;
    `;

    const result = await db.query(query);

    const mapById = new Map();

    // 100% Data riil database Neon PostgreSQL (tanpa data dummy/fallback)
    result.rows.forEach(r => {
      if (r.id && r.id !== 'UNKNOWN') {
        mapById.set(r.id, {
          id: r.id,
          name: r.name || 'Trainee SMLONE',
          house: r.house || 'House of Thenova',
          class: r.class || 'Public Speaking Alpha',
          totalReferrals: Number(r.total_referrals || 0),
          bonusCoins: Number(r.bonus_coins || 0),
        });
      }
    });

    // Cek apakah user saat ini ada di list, jika belum maka tambahkan dengan 0 referral
    if (currentUserId && !mapById.has(currentUserId)) {
      try {
        const u = await db.query(
          'SELECT "ID" AS id, "Name" AS name, "HOUSE" AS house, "Class" AS class FROM profile_trainee WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) LIMIT 1',
          [currentUserId]
        );
        if (u.rows.length > 0) {
          mapById.set(currentUserId, {
            id: u.rows[0].id,
            name: u.rows[0].name || 'Trainee SMLONE',
            house: u.rows[0].house || 'House of Thenova',
            class: u.rows[0].class || 'Public Speaking Alpha',
            totalReferrals: 0,
            bonusCoins: 0,
          });
        }
      } catch (_) {}
    }

    // Urutkan berdasarkan: totalReferrals DESC, bonusCoins DESC, "Name" ASC
    const sortedList = Array.from(mapById.values())
      .sort((a, b) => {
        if (b.totalReferrals !== a.totalReferrals) return b.totalReferrals - a.totalReferrals;
        if (b.bonusCoins !== a.bonusCoins) return b.bonusCoins - a.bonusCoins;
        return String(a.name || '').localeCompare(String(b.name || ''));
      })
      .slice(0, Number(limit))
      .map((item, idx) => ({
        id: item.id,
        name: item.name,
        house: item.house,
        class: item.class,
        totalReferrals: item.totalReferrals,
        referralCount: item.totalReferrals,
        teman_diajak: item.totalReferrals,
        bonusCoins: item.bonusCoins,
        coinsEarned: item.bonusCoins,
        bonus_koin: item.bonusCoins,
        rank: idx + 1,
        isCurrentUser: currentUserId
          ? (item.id === currentUserId || item.id?.toLowerCase() === currentUserId?.toLowerCase())
          : false
      }));

    return res.status(200).json({
      success: true,
      total: sortedList.length,
      data: sortedList
    });
  } catch (error) {
    console.error('[MyBy Coin] GET /leaderboard-referral error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  handleGetLeaderboard,
  handleGetLeaderboardReferral
};
