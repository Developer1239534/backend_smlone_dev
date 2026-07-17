const express = require('express');
const router = express.Router();
const Ably = require('ably');
const db = require('../db/neonClient');

// Initialize Ably client with secret key (Only available on backend)
// Note: If ABLY_API_KEY is not set, it might throw, but we handle it gracefully if possible.
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (!ablyKey) {
    throw new Error('ABLY_API_KEY is not defined in .env');
  }
  
  ably = new Ably.Rest(ablyKey);
  console.log("✅ Ably initialized successfully on backend.");
} catch (err) {
  console.error("❌ Failed to initialize Ably:", err.message);
}

// 1. GET /auth — Provide Ably Token to the frontend securely
router.get('/auth', async (req, res) => {
  try {
    if (!ably) {
      return res.status(500).json({ success: false, message: 'Ably not configured on server' });
    }
    const tokenParams = { clientId: 'smlone-client-' + Math.random().toString(36).substr(2, 9) };
    const tokenRequest = await ably.auth.createTokenRequest(tokenParams);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(tokenRequest));
  } catch (err) {
    console.error("Ably Auth Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET /:trainee_id — Get chat history for a specific trainee
router.get('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM chat_messages WHERE trainee_id = $1 ORDER BY created_at ASC',
      [trainee_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get Chat History Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. POST /send — Send a message (Trainee or Admin)
// Body: { trainee_id: "...", sender_type: "ADMIN" | "TRAINEE", message: "..." }
router.post('/send', async (req, res) => {
  const { trainee_id, sender_type, message } = req.body;

  if (!trainee_id || !sender_type || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (sender_type !== 'ADMIN' && sender_type !== 'TRAINEE') {
    return res.status(400).json({ success: false, message: 'Invalid sender_type' });
  }

  try {
    // Save to DB
    const insertResult = await db.query(
      `INSERT INTO chat_messages (trainee_id, sender_type, message) 
       VALUES ($1, $2, $3) RETURNING *`,
      [trainee_id, sender_type, message]
    );

    const savedMessage = insertResult.rows[0];

    // Publish to Ably
    if (ably) {
      const channelName = `chat:${trainee_id}`;
      const channel = ably.channels.get(channelName);
      await channel.publish('new_message', savedMessage);
    }

    res.status(201).json({ success: true, data: savedMessage });
  } catch (err) {
    console.error("Send Chat Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 4. GET /admin/inbox — Get list of trainees who have chatted (For Admin panel)
router.get('/admin/inbox', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.trainee_id, 
        d.trainee_name as fullname, 
        MAX(c.created_at) as last_message_time,
        (SELECT message FROM chat_messages c2 WHERE c2.trainee_id = c.trainee_id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_messages c
      JOIN dashboard_trainne d ON c.trainee_id = d.id
      GROUP BY c.trainee_id, d.trainee_name
      ORDER BY last_message_time DESC;
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get Inbox Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 5. PUT /message/:id — Edit a specific message
router.put('/message/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  try {
    const result = await db.query(
      'UPDATE chat_messages SET message = $1 WHERE id = $2 RETURNING *',
      [message, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Message not found' });
    
    const updatedMessage = result.rows[0];
    if (ably) {
      const channel = ably.channels.get(`chat:${updatedMessage.trainee_id}`);
      await channel.publish('message_edited', updatedMessage);
    }
    res.json({ success: true, data: updatedMessage });
  } catch (err) {
    console.error("Edit Message Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 6. DELETE /message/:id — Delete a specific message
router.delete('/message/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM chat_messages WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Message not found' });
    
    const deletedMessage = result.rows[0];
    if (ably) {
      const channel = ably.channels.get(`chat:${deletedMessage.trainee_id}`);
      await channel.publish('message_deleted', { id });
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error("Delete Message Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 7. DELETE /clear/:trainee_id — Clear all chat history for a trainee
router.delete('/clear/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    await db.query('DELETE FROM chat_messages WHERE trainee_id = $1', [trainee_id]);
    if (ably) {
      const channel = ably.channels.get(`chat:${trainee_id}`);
      await channel.publish('chat_cleared', { trainee_id });
    }
    res.json({ success: true, message: 'All chat history for trainee deleted' });
  } catch (err) {
    console.error("Clear Chat Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
