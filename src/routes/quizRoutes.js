const express = require('express');
const { pool } = require('../db/neonClient');

const router = express.Router();

// GET /api/quiz/questions
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

// POST /api/quiz/submit
// Accepts answers array, calculates the dominant House, and returns the result
router.post('/submit', async (req, res) => {
  try {
    const { studentId, answers } = req.body;
    
    if (!studentId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Tally the answers
    // answers format: [{ questionId: 1, selectedOption: 'A' }, ...]
    const scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    
    answers.forEach(ans => {
      const opt = ans.selectedOption.toUpperCase();
      if (scores[opt] !== undefined) {
        scores[opt]++;
      }
    });

    // Find the max score
    let dominantOption = 'A';
    let maxScore = -1;

    // We can randomize tie-breaker or just pick the first one that reached the max
    // Standard iteration favors the earlier options in case of a tie
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

    // Save to Database
    const saveResult = await pool.query(
      `INSERT INTO user_results (student_id, assigned_house, answers)
       VALUES ($1, $2, $3) RETURNING id`,
      [studentId, assignedHouseId, JSON.stringify(answers)]
    );

    res.json({
      success: true,
      result: {
        recordId: saveResult.rows[0].id,
        scores,
        assignedHouse: houseDetails
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/quiz/backend-history/:studentId
// Returns the history of quiz results for a specific student
router.get('/backend-history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query(`
      SELECT ur.id, ur.student_id, ur.assigned_house, ur.created_at, 
             h.name as house_name, h.description as house_description, h.core_value as house_core_value
      FROM user_results ur
      JOIN houses h ON ur.assigned_house = h.id
      WHERE ur.student_id = $1
      ORDER BY ur.created_at DESC
    `, [studentId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
