const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/neonClient');

// Cache to store processed inbox IDs to prevent duplicate processing (Anti-Spam)
const processedInboxIds = new Set();

// Helper to generate a secure random alphanumeric password
function generateRandomPassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper to generate a unique random 6-digit Student ID
async function generateUniqueStudentId() {
  let isUnique = false;
  let newId = '';
  while (!isUnique) {
    newId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random number
    const result = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [newId]);
    if (result.rows.length === 0) {
      isUnique = true;
    }
  }
  return newId;
}

// Webhook endpoint for Fonnte WhatsApp Gateway
// GET /api/webhook/fonnte
router.get('/fonnte', (req, res) => {
  res.json({ success: true, message: 'Fonnte WhatsApp Webhook is active and waiting for POST requests!' });
});

// POST /api/webhook/fonnte
router.post('/fonnte', async (req, res) => {
  console.log('[Fonnte Webhook] Incoming Request Body:', req.body);
  const { sender, message, inboxid } = req.body;

  // Acknowledge the webhook request immediately to Fonnte
  res.status(200).json({ success: true, message: 'Webhook received' });

  // If no sender or message, stop processing
  if (!sender || !message) {
    return;
  }

  // Anti-Spam / Deduplication: If this message was already processed recently, skip it
  if (inboxid && processedInboxIds.has(inboxid)) {
    console.log(`[Fonnte Webhook] Duplicate request ignored for inboxid: ${inboxid}`);
    return;
  }

  // Register inboxid in cache and set to auto-remove after 2 minutes
  if (inboxid) {
    processedInboxIds.add(inboxid);
    setTimeout(() => {
      processedInboxIds.delete(inboxid);
    }, 120000); // 2 minutes
  }

  console.log(`[Fonnte Webhook] Received message from ${sender}: "${message}"`);

  // Check if message is exactly "Request ID dan Password" (case-insensitive)
  if (message.trim().toLowerCase() === 'request id dan password') {
    let replyMessage = '';

    try {
      // 1. Check if a trainee with this phone number (sender) already exists
      const queryResult = await db.query(
        'SELECT id FROM dashboard_trainne WHERE phone = $1',
        [sender]
      );

      // Generate a temporary random password
      const tempPassword = generateRandomPassword(8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      if (queryResult.rows.length > 0) {
        // Trainee already exists, update password and return their ID and new password
        const trainee = queryResult.rows[0];
        
        await db.query(
          'UPDATE dashboard_trainne SET password = $1 WHERE id = $2',
          [hashedPassword, trainee.id]
        );

        replyMessage = `Student ID: *${trainee.id}*\nPassword: *${tempPassword}*`;
      } else {
        // Trainee does not exist, create a new unique ID and register them
        const newId = await generateUniqueStudentId();
        
        await db.query(
          'INSERT INTO dashboard_trainne (id, trainee_name, phone, password, status) VALUES ($1, $2, $3, $4, $5)',
          [newId, `Trainee ${sender}`, sender, hashedPassword, 'Active']
        );

        replyMessage = `Student ID: *${newId}*\nPassword: *${tempPassword}*`;
      }
    } catch (err) {
      console.error('[Fonnte Webhook] Database error:', err.message);
      replyMessage = 'Terjadi kesalahan server internal.';
    }

    // Send the reply message back to the sender using Fonnte API
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (!fonnteToken) {
      console.warn('⚠️  WARNING: FONNTE_TOKEN is not set in environment variables! Cannot send WhatsApp reply.');
      return;
    }

    try {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: sender,
          message: replyMessage,
          inboxid: inboxid
        })
      });

      const resData = await response.json();
      console.log('[Fonnte Webhook] WhatsApp reply sent. Status:', resData.status ? 'Success' : 'Failed', resData.reason || '');
    } catch (apiErr) {
      console.error('[Fonnte Webhook] Error calling Fonnte API:', apiErr.message);
    }
  } else {
    // Optional: reply with help format if message looks like an attempt to get credentials but format is wrong
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('request id') || lowerMsg.includes('password') || lowerMsg.includes('id murid')) {
      const fonnteToken = process.env.FONNTE_TOKEN;
      if (!fonnteToken) return;

      const helpMessage = 'Format pesan salah. Silakan kirim pesan berisi:\n\n*Request ID dan Password*';
      
      try {
        await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': fonnteToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target: sender,
            message: helpMessage,
            inboxid: inboxid
          })
        });
      } catch (err) {
        console.error('[Fonnte Webhook] Error sending help message:', err.message);
      }
    }
  }
});

module.exports = router;
