const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to sanitize string inputs
const cleanStr = (v) => {
  if (v === null || v === undefined || v === 'null') return null;
  const str = String(v).trim();
  return str === '' ? null : str;
};

// Helper to format options (JSONB, Array, or String)
function parseOptions(rawOptions) {
  if (rawOptions === null || rawOptions === undefined) return null;
  if (typeof rawOptions === 'object') return rawOptions;
  if (typeof rawOptions === 'string') {
    const trimmed = rawOptions.trim();
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return trimmed;
      }
    }
    return trimmed;
  }
  return rawOptions;
}

// 1. GET / - Retrieve all house allegiance questions
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT "id", "question", "options" FROM house_allegiance WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND ("question" ILIKE $${params.length})`;
    }

    query += ' ORDER BY "id" ASC';

    const result = await db.query(query, params);

    // Map rows so both id and number are provided for backwards compatibility
    const mapped = result.rows.map(row => ({
      id: row.id,
      number: row.id,
      question: row.question,
      options: row.options
    }));

    res.json({
      success: true,
      count: mapped.length,
      data: mapped
    });
  } catch (err) {
    console.error('[House Allegiance] GET Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data house_allegiance', error: err.message });
  }
});

// 2. GET /:id - Get single question by ID
router.get('/:id', async (req, res) => {
  try {
    const idVal = parseInt(req.params.id, 10);
    if (isNaN(idVal)) {
      return res.status(400).json({ success: false, message: 'Parameter id harus berupa angka.' });
    }

    const result = await db.query(
      'SELECT "id", "question", "options" FROM house_allegiance WHERE "id" = $1',
      [idVal]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pertanyaan ID ${idVal} tidak ditemukan.` });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        number: row.id,
        question: row.question,
        options: row.options
      }
    });
  } catch (err) {
    console.error('[House Allegiance] GET BY ID Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data house_allegiance', error: err.message });
  }
});

// 3. POST / - Create or Batch Insert House Allegiance Questions
router.post('/', async (req, res) => {
  try {
    const bodyData = req.body?.data || req.body?.items || req.body;

    if (!bodyData) {
      return res.status(400).json({ success: false, message: 'Request body tidak boleh kosong.' });
    }

    // Handle Array Batch Insert
    if (Array.isArray(bodyData)) {
      if (bodyData.length === 0) {
        return res.status(400).json({ success: false, message: 'Array data tidak boleh kosong.' });
      }

      const replaceMode = req.query.replace === 'true' || req.body?.replace === true;
      if (replaceMode) {
        await db.query('TRUNCATE TABLE house_allegiance RESTART IDENTITY;');
      }

      const inserted = [];
      for (const item of bodyData) {
        const rawId = item['id'] ?? item.id ?? item.number ?? item.no;
        const idVal = rawId !== undefined && rawId !== null ? parseInt(rawId, 10) : null;
        const question = cleanStr(item['question'] || item.question || item.pertanyaan);
        const options = parseOptions(item['options'] ?? item.options);

        if (question) {
          let resQ;
          if (idVal && !isNaN(idVal)) {
            const insertQuery = `
              INSERT INTO house_allegiance ("id", "question", "options")
              VALUES ($1, $2, $3)
              ON CONFLICT ("id") DO UPDATE SET
                "question" = EXCLUDED."question",
                "options" = EXCLUDED."options"
              RETURNING "id", "question", "options";
            `;
            resQ = await db.query(insertQuery, [idVal, question, JSON.stringify(options)]);
          } else {
            const insertQuery = `
              INSERT INTO house_allegiance ("question", "options")
              VALUES ($1, $2)
              RETURNING "id", "question", "options";
            `;
            resQ = await db.query(insertQuery, [question, JSON.stringify(options)]);
          }
          const row = resQ.rows[0];
          inserted.push({
            id: row.id,
            number: row.id,
            question: row.question,
            options: row.options
          });
        }
      }

      return res.status(201).json({
        success: true,
        message: `Berhasil menambahkan ${inserted.length} data house_allegiance.`,
        count: inserted.length,
        data: inserted
      });
    }

    // Handle Single Object Insert
    const rawId = bodyData['id'] ?? bodyData.id ?? bodyData.number ?? bodyData.no;
    const idVal = rawId !== undefined && rawId !== null ? parseInt(rawId, 10) : null;
    const question = cleanStr(bodyData['question'] || bodyData.question || bodyData.pertanyaan);
    const options = parseOptions(bodyData['options'] ?? bodyData.options);

    if (!question) {
      return res.status(400).json({ success: false, message: 'Field "question" wajib diisi.' });
    }

    let result;
    if (idVal && !isNaN(idVal)) {
      const insertQuery = `
        INSERT INTO house_allegiance ("id", "question", "options")
        VALUES ($1, $2, $3)
        ON CONFLICT ("id") DO UPDATE SET
          "question" = EXCLUDED."question",
          "options" = EXCLUDED."options"
        RETURNING "id", "question", "options";
      `;
      result = await db.query(insertQuery, [idVal, question, JSON.stringify(options)]);
    } else {
      const insertQuery = `
        INSERT INTO house_allegiance ("question", "options")
        VALUES ($1, $2)
        RETURNING "id", "question", "options";
      `;
      result = await db.query(insertQuery, [question, JSON.stringify(options)]);
    }

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Data house_allegiance berhasil disimpan.',
      data: {
        id: row.id,
        number: row.id,
        question: row.question,
        options: row.options
      }
    });
  } catch (err) {
    console.error('[House Allegiance] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data house_allegiance', error: err.message });
  }
});

// 4. PUT /:id - Update question and options by ID
router.put('/:id', async (req, res) => {
  try {
    const idVal = parseInt(req.params.id, 10);
    if (isNaN(idVal)) {
      return res.status(400).json({ success: false, message: 'Parameter id harus berupa angka.' });
    }

    const body = req.body || {};
    const question = cleanStr(body['question'] || body.question);
    const options = parseOptions(body['options'] ?? body.options);

    const updateQuery = `
      UPDATE house_allegiance SET
        "question" = COALESCE($1, "question"),
        "options" = COALESCE($2, "options")
      WHERE "id" = $3
      RETURNING "id", "question", "options";
    `;
    const result = await db.query(updateQuery, [
      question,
      options ? JSON.stringify(options) : null,
      idVal
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pertanyaan ID ${idVal} tidak ditemukan.` });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      message: 'Data house_allegiance berhasil diperbarui.',
      data: {
        id: row.id,
        number: row.id,
        question: row.question,
        options: row.options
      }
    });
  } catch (err) {
    console.error('[House Allegiance] PUT Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data house_allegiance', error: err.message });
  }
});

// 5. DELETE /:id - Delete question by ID
router.delete('/:id', async (req, res) => {
  try {
    const idVal = parseInt(req.params.id, 10);
    if (isNaN(idVal)) {
      return res.status(400).json({ success: false, message: 'Parameter id harus berupa angka.' });
    }

    const result = await db.query('DELETE FROM house_allegiance WHERE "id" = $1 RETURNING *', [idVal]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pertanyaan ID ${idVal} tidak ditemukan.` });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      message: `Data house_allegiance ID ${idVal} berhasil dihapus.`,
      data: {
        id: row.id,
        number: row.id,
        question: row.question,
        options: row.options
      }
    });
  } catch (err) {
    console.error('[House Allegiance] DELETE Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus data house_allegiance', error: err.message });
  }
});

module.exports = router;
