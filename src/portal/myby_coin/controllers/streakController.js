/**
 * ============================================================
 * MYBY COIN - STREAK & OVERVIEW CONTROLLER
 * ============================================================
 * Menangani alur backend untuk:
 * 1. GET /overview/:traineeId (status saldo, rentetan streak, siklus 7 hari)
 * 2. POST /streak/claim (klaim koin harian secara atomic)
 * 3. POST /daily-checkin (alias klaim harian)
 * ============================================================
 */

const db = require('../../../db/neonClient');
const { ensureMyByCoinTables, getTraineeProfile } = require('../mybyCoinDatabase');
const { CYCLE_BONUSES, DAY_NAMES, getWIBDate } = require('../mybyCoinConstants');

/**
 * GET /overview/:traineeId
 * Mengambil ringkasan saldo koin & streak anak dari database
 */
async function handleGetOverview(req, res) {
  const traineeId = req.params.traineeId || req.query.traineeId || req.query.id;
  if (!traineeId) {
    return res.status(400).json({ success: false, message: 'traineeId wajib disertakan.' });
  }

  try {
    await ensureMyByCoinTables();
    const today = getWIBDate();
    const yesterday = getWIBDate(-1);

    // Ambil info profil anak (ID sebagai Primary Key, Name sebagai Secondary Key)
    const profile = await getTraineeProfile(traineeId);

    // Ambil Wallet (upsert default jika belum ada dengan balance 0)
    let walletRes = await db.query(
      'SELECT * FROM myby_trainee_wallets WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) OR "Name" = $1 LIMIT 1',
      [profile.ID]
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
    const wallet = walletRes.rows[0] || { balance: 0, total_earned: 0, total_spent: 0 };

    // Ambil Streak dengan CAST ::TEXT agar tanggal akurat
    let streakRes = await db.query(`
      SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day, 
             last_check_in_date::TEXT AS last_check_in_date, total_check_ins 
      FROM myby_trainee_streaks 
      WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) OR "Name" = $1 LIMIT 1
    `, [profile.ID]);

    if (streakRes.rows.length === 0) {
      await db.query(
        'INSERT INTO myby_trainee_streaks ("ID", "Name", current_streak, longest_streak, streak_cycle_day) VALUES ($1, $2, 0, 0, 1) ON CONFLICT ("ID") DO UPDATE SET "Name" = EXCLUDED."Name"',
        [profile.ID, profile.Name]
      );
      streakRes = await db.query(`
        SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day, 
               last_check_in_date::TEXT AS last_check_in_date, total_check_ins 
        FROM myby_trainee_streaks 
        WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) LIMIT 1
      `, [profile.ID]);
    }
    const streak = streakRes.rows[0] || { current_streak: 0, longest_streak: 0, streak_cycle_day: 1, last_check_in_date: null };

    // Evaluasi tanggal check in terakhir zona WIB
    let currentStreak = Number(streak.current_streak || 0);
    let longestStreak = Number(streak.longest_streak || 0);
    let cycleDay = Number(streak.streak_cycle_day || 1);

    const lastDateStr = streak.last_check_in_date ? String(streak.last_check_in_date).substring(0, 10) : null;
    const hasCheckedInToday = lastDateStr === today;

    let streakBroken = false;
    if (!hasCheckedInToday && lastDateStr !== null && lastDateStr !== yesterday) {
      streakBroken = true;
      currentStreak = 0;
      cycleDay = 1;
    }

    const todayBonusAvailable = CYCLE_BONUSES[(cycleDay - 1) % 7] || 20;

    // Bentuk data visual 7 hari
    const days = DAY_NAMES.map((name, idx) => {
      const dayNum = idx + 1;
      let done = false;
      if (hasCheckedInToday) {
        done = dayNum <= cycleDay;
      } else {
        done = dayNum < cycleDay;
      }
      return {
        name,
        label: `Day ${dayNum}`,
        bonus: CYCLE_BONUSES[idx],
        done,
        isToday: dayNum === cycleDay
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        traineeId: profile.ID,
        ID: profile.ID,
        name: profile.Name,
        Name: profile.Name,
        house: profile.HOUSE,
        class: profile.Class,
        wallet: {
          balance: Number(wallet.balance || 0),
          totalEarned: Number(wallet.total_earned || 0),
          totalSpent: Number(wallet.total_spent || 0)
        },
        streak: {
          currentStreak,
          longestStreak,
          cycleDay,
          lastCheckInDate: lastDateStr,
          hasCheckedInToday,
          streakBroken,
          todayBonusAvailable,
          days
        }
      }
    });
  } catch (error) {
    console.error('[MyBy Coin] GET /overview error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /streak/claim
 * Memproses klaim streak harian secara atomic di database
 */
async function handleClaimStreak(req, res) {
  const { traineeId } = req.body;
  if (!traineeId) {
    return res.status(400).json({ success: false, message: 'traineeId wajib disertakan.' });
  }

  try {
    await ensureMyByCoinTables();
    const today = getWIBDate();
    const yesterday = getWIBDate(-1);

    // Ambil profile lengkap dengan ID (PK) dan Name (Secondary Key)
    const profile = await getTraineeProfile(traineeId);

    // Ambil data streak saat ini
    let streakRes = await db.query(`
      SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day, 
             last_check_in_date::TEXT AS last_check_in_date, total_check_ins 
      FROM myby_trainee_streaks 
      WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) OR "Name" = $1 LIMIT 1
    `, [profile.ID]);
    let prevStreak = streakRes.rows[0];

    if (!prevStreak) {
      await db.query(
        'INSERT INTO myby_trainee_streaks ("ID", "Name", current_streak, longest_streak, streak_cycle_day) VALUES ($1, $2, 0, 0, 1) ON CONFLICT ("ID") DO UPDATE SET "Name" = EXCLUDED."Name"',
        [profile.ID, profile.Name]
      );
      const r = await db.query(`
        SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day, 
               last_check_in_date::TEXT AS last_check_in_date, total_check_ins 
        FROM myby_trainee_streaks 
        WHERE "ID" = $1 OR LOWER("ID") = LOWER($1) LIMIT 1
      `, [profile.ID]);
      prevStreak = r.rows[0];
    }

    const lastDateStr = prevStreak && prevStreak.last_check_in_date ? String(prevStreak.last_check_in_date).substring(0, 10) : null;

    // Cegah klaim ganda di hari yang sama
    if (lastDateStr === today) {
      return res.status(400).json({
        success: false,
        alreadyClaimed: true,
        message: 'Anda sudah mengklaim hadiah streak hari ini! Silakan kembali besok.'
      });
    }

    // Kalkulasi streak baru di server
    let newStreak = 1;
    let newCycleDay = 1;

    if (lastDateStr === yesterday) {
      newStreak = (Number(prevStreak.current_streak) || 0) + 1;
      newCycleDay = ((Number(prevStreak.streak_cycle_day) || 1) % 7) + 1;
    } else {
      newStreak = 1;
      newCycleDay = 1;
    }

    const prevLongest = Number(prevStreak.longest_streak || 0);
    const newLongest = Math.max(prevLongest, newStreak);
    const bonusCoin = CYCLE_BONUSES[(newCycleDay - 1) % 7] || 20;

    // Eksekusi Transaksi Database (Atomic)
    await db.query('BEGIN');

    // 1. Update Streak dengan ID sebagai PK dan Name sebagai Secondary Key
    await db.query(`
      UPDATE myby_trainee_streaks 
      SET current_streak = $1, 
          longest_streak = $2, 
          streak_cycle_day = $3, 
          last_check_in_date = $4,
          total_check_ins = total_check_ins + 1,
          "Name" = $5,
          updated_at = NOW()
      WHERE "ID" = $6 OR LOWER("ID") = LOWER($6)
    `, [newStreak, newLongest, newCycleDay, today, profile.Name, profile.ID]);

    // 2. Update Saldo Wallet
    const walletUpdate = await db.query(`
      INSERT INTO myby_trainee_wallets ("ID", "Name", balance, total_earned)
      VALUES ($1, $2, $3, $3)
      ON CONFLICT ("ID") 
      DO UPDATE SET 
        balance = myby_trainee_wallets.balance + $3,
        total_earned = myby_trainee_wallets.total_earned + $3,
        "Name" = EXCLUDED."Name",
        updated_at = NOW()
      RETURNING balance
    `, [profile.ID, profile.Name, bonusCoin]);

    const newBalance = walletUpdate.rows[0].balance;

    // 3. Catat Riwayat Transaksi Murni: "Day X Streak"
    const txId = `tx-streak-${Date.now()}`;
    await db.query(`
      INSERT INTO myby_coin_transactions (id, "ID", "Name", title, amount, type, badge)
      VALUES ($1, $2, $3, $4, $5, 'earn', 'Streak Reward')
    `, [txId, profile.ID, profile.Name, `Day ${newStreak} Streak`, bonusCoin]);

    await db.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Check-in berhasil! +${bonusCoin} MYBY Coin ditambahkan ke saldo Anda.`,
      data: {
        coinsAwarded: bonusCoin,
        newBalance: Number(newBalance),
        currentStreak: newStreak,
        longestStreak: newLongest,
        cycleDay: newCycleDay,
        hasCheckedInToday: true,
        transactionId: txId,
        transactionTitle: `Day ${newStreak} Streak`
      }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('[MyBy Coin] POST /streak/claim error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /daily-checkin (Alias)
 */
function handleDailyCheckin(req, res, next) {
  if (!req.body.traineeId && req.query.traineeId) {
    req.body.traineeId = req.query.traineeId;
  }
  return handleClaimStreak(req, res);
}

module.exports = {
  handleGetOverview,
  handleClaimStreak,
  handleDailyCheckin
};
