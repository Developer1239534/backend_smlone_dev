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
    let query = 'SELECT "number", "question", "options" FROM house_allegiance WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND ("question" ILIKE $${params.length})`;
    }

    query += ' ORDER BY "number" ASC';

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('[House Allegiance] GET Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data house_allegiance', error: err.message });
  }
});

// 2. GET /:number - Get single question by number
router.get('/:number', async (req, res) => {
  try {
    const numberVal = parseInt(req.params.number, 10);
    if (isNaN(numberVal)) {
      return res.status(400).json({ success: false, message: 'Parameter number harus berupa angka.' });
    }

    const result = await db.query(
      'SELECT "number", "question", "options" FROM house_allegiance WHERE "number" = $1',
      [numberVal]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pertanyaan nomor ${numberVal} tidak ditemukan.` });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[House Allegiance] GET BY NUMBER Error:', err.message);
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
        await db.query('TRUNCATE TABLE house_allegiance;');
      }

      const inserted = [];
      for (const item of bodyData) {
        const rawNumber = item['number'] ?? item.number ?? item.no ?? item.id;
        const numberVal = parseInt(rawNumber, 10);
        const question = cleanStr(item['question'] || item.question || item.pertanyaan);
        const options = parseOptions(item['options'] ?? item.options);

        if (!isNaN(numberVal) && question) {
          const insertQuery = `
            INSERT INTO house_allegiance ("number", "question", "options")
            VALUES ($1, $2, $3)
            ON CONFLICT ("number") DO UPDATE SET
              "question" = EXCLUDED."question",
              "options" = EXCLUDED."options"
            RETURNING "number", "question", "options";
          `;
          const resQ = await db.query(insertQuery, [numberVal, question, JSON.stringify(options)]);
          inserted.push(resQ.rows[0]);
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
    const rawNumber = bodyData['number'] ?? bodyData.number ?? bodyData.no ?? bodyData.id;
    const numberVal = parseInt(rawNumber, 10);
    const question = cleanStr(bodyData['question'] || bodyData.question || bodyData.pertanyaan);
    const options = parseOptions(bodyData['options'] ?? bodyData.options);

    if (isNaN(numberVal) || !question) {
      return res.status(400).json({ success: false, message: 'Field "number" dan "question" wajib diisi.' });
    }

    const insertQuery = `
      INSERT INTO house_allegiance ("number", "question", "options")
      VALUES ($1, $2, $3)
      ON CONFLICT ("number") DO UPDATE SET
        "question" = EXCLUDED."question",
        "options" = EXCLUDED."options"
      RETURNING "number", "question", "options";
    `;
    const result = await db.query(insertQuery, [numberVal, question, JSON.stringify(options)]);

    res.status(201).json({
      success: true,
      message: 'Data house_allegiance berhasil disimpan.',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('[House Allegiance] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data house_allegiance', error: err.message });
  }
});

// 4. PUT /:number - Update question and options by number
router.put('/:number', async (req, res) => {
  try {
    const numberVal = parseInt(req.params.number, 10);
    if (isNaN(numberVal)) {
      return res.status(400).json({ success: false, message: 'Parameter number harus berupa angka.' });
    }

    const body = req.body || {};
    const question = cleanStr(body['question'] || body.question);
    const options = parseOptions(body['options'] ?? body.options);

    const updateQuery = `
      UPDATE house_allegiance SET
        "question" = COALESCE($1, "question"),
        "options" = COALESCE($2, "options")
      WHERE "number" = $3
      RETURNING "number", "question", "options";
    `;
    const result = await db.query(updateQuery, [
      question,
      options ? JSON.stringify(options) : null,
      numberVal
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pertanyaan nomor ${numberVal} tidak ditemukan.` });
    }

    res.json({ success: true, message: 'Data house_allegiance berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[House Allegiance] PUT Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data house_allegiance', error: err.message });
  }
});

// 5. DELETE /:number - Delete question by number
router.delete('/:number', async (req, res) => {
  try {
    const numberVal = parseInt(req.params.number, 10);
    if (isNaN(numberVal)) {
      return res.status(400).json({ success: false, message: 'Parameter number harus berupa angka.' });
    }

    const result = await db.query('DELETE FROM house_allegiance WHERE "number" = $1 RETURNING *', [numberVal]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pertanyaan nomor ${numberVal} tidak ditemukan.` });
    }

    res.json({ success: true, message: `Data house_allegiance nomor ${numberVal} berhasil dihapus.`, data: result.rows[0] });
  } catch (err) {
    console.error('[House Allegiance] DELETE Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus data house_allegiance', error: err.message });
  }
});

module.exports = router;
