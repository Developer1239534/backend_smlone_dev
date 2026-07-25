const express = require('express');
const { pool } = require('../db/neonClient');

const router = express.Router();

// 1. GET /api/quiz/questions
// Returns all 25 questions with their options
router.get('/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, question_text, option_a, option_b, option_c, option_d, option_e FROM questions ORDER BY id ASC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. GET /api/quiz/submit
router.get('/submit', (req, res) => {
  res.json({ success: true, message: 'Quiz Submit endpoint is active! Please send a POST request with studentId and answers array to submit kuis.' });
});

// 3. POST /api/quiz/submit
// Accepts answers array, calculates the dominant House, saves to quiz_history, updates class, and returns the result (Limit 1 attempt)
router.post('/submit', async (req, res) => {
  try {
    const { studentId, answers } = req.body;
    
    if (!studentId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'ID murid (studentId) dan jawaban (answers) wajib diisi.' });
    }

    // Restriction: Check if the student has already taken the quiz (Only 1 attempt allowed)
    const existingHistory = await pool.query(
      'SELECT student_id FROM quiz_history WHERE student_id = $1',
      [studentId]
    );

    if (existingHistory.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah pernah mengerjakan kuis ini sebelumnya. Setiap murid hanya diperbolehkan mengerjakan kuis sebanyak 1 kali.',
        alreadySubmitted: true
      });
    }

    // Tally the answers
    // answers format: [{ questionId: 1, selectedOption: 'A' }, ...]
    const scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    
    answers.forEach(ans => {
      if (ans.selectedOption) {
        const opt = ans.selectedOption.toUpperCase();
        if (scores[opt] !== undefined) {
          scores[opt]++;
        }
      }
    });

    // Find the max score
    let dominantOption = 'A';
    let maxScore = -1;

    for (const [opt, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantOption = opt;
      }
    }

    // Map option to House
    const houseMap = {
      'A': 'Thenova',
      'B': 'Havaria',
      'C': 'Reverion',
      'D': 'Quorion',
      'E': 'Creanova'
    };
    
    const assignedHouseId = houseMap[dominantOption];

    // Get House Details
    const houseResult = await pool.query('SELECT * FROM houses WHERE id = $1', [assignedHouseId]);
    const houseDetails = houseResult.rows[0];

    // Transaction to insert history and update trainee profile
    await pool.query('BEGIN');

    // 1. Save quiz results to quiz_history
    await pool.query(
      'INSERT INTO quiz_history (student_id, assigned_house, scores) VALUES ($1, $2, $3)',
      [studentId, assignedHouseId, JSON.stringify(scores)]
    );

    // 2. Update the student\'s house_sml to their new assigned House in dashboard_trainne
    await pool.query(
      'UPDATE dashboard_trainne SET house_sml = $1 WHERE id = $2',
      [assignedHouseId, studentId]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Kuis berhasil diselesaikan dan disimpan ke riwayat!',
      result: {
        scores,
        assignedHouse: houseDetails
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 4. GET /api/quiz/backend-history
// Fetch all quiz histories
router.get('/backend-history', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qh.*, dt.trainee_name, h.name as house_name, h.core_value as house_core_value
       FROM quiz_history qh
       LEFT JOIN dashboard_trainne dt ON qh.student_id = dt.id
       LEFT JOIN houses h ON qh.assigned_house = h.id
       ORDER BY qh.submitted_at DESC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching quiz histories:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 5. GET /api/quiz/backend-history/:studentId
// Fetch quiz history for a specific student (with full House details)
router.get('/backend-history/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `SELECT qh.*, dt.trainee_name, h.name as house_name, h.description as house_description, h.core_value as house_core_value
       FROM quiz_history qh
       LEFT JOIN dashboard_trainne dt ON qh.student_id = dt.id
       LEFT JOIN houses h ON qh.assigned_house = h.id
       WHERE qh.student_id = $1`,
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        hasHistory: false,
        data: null,
        message: `Riwayat kuis untuk murid ID ${studentId} belum ada.`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching student quiz history:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
