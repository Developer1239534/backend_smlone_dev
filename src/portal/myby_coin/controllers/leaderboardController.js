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

module.exports = {
  handleGetLeaderboard
};
